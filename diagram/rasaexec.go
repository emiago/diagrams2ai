package diagram

import (
	"bytes"
	"diagrams2ai/dbmodel"
	"fmt"
	"os"
	"os/exec"
	"os/user"
	"strings"
	"sync"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/otiai10/copy"
)

var (
	nextport int = 15005
	runmutex sync.Mutex
	// map[string]port
)

func GetDiagramFile(id string) string {
	return fmt.Sprintf("%s/%s.json", DIAGRAMSDIR, id)
}

func RasaGetConf(m Diagram) (modeldir string) {
	pwd, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	return fmt.Sprintf("%s/rasa/%s", pwd, m.Id)
}

func RasaDockerRun(arg ...string) *exec.Cmd {
	user, err := user.Current()
	if err != nil {
		panic(err)
	}

	args := []string{
		"run",
		"--user", fmt.Sprintf("%s:%s", user.Uid, user.Gid),
	}
	args = append(args, arg...)

	log.Println("Running docker", args)
	cmd := exec.Command("docker", args...)
	return cmd
}

func RasaGetModelDir(id string) (modeldir string) {
	if _, err := os.Stat(RASADIR); os.IsNotExist(err) {
		if err := os.MkdirAll(RASADIR, 0777); err != nil {
			log.Fatal(err)
		}
	}

	if !strings.HasPrefix(RASADIR, "/") {
		pwd, err := os.Getwd()
		if err != nil {
			log.Fatal(err)
		}

		return fmt.Sprintf("%s/%s/%s", pwd, RASADIR, id)
	}

	return fmt.Sprintf("%s/%s", RASADIR, id)
}

func RasaInitModel(modeldir string) {
	if _, err := os.Stat(modeldir); err == nil || os.IsExist(err) {
		return
	} else {
		log.Println("Folder does not exists", err)
	}

	// if err := os.MkdirAll(RASADIR, 0777); err != nil {
	// 	log.Fatal(err)
	// }

	log.Println("Folder creating from default conf", modeldir)

	if err := copy.Copy("rasa-conf", modeldir); err != nil {
		log.Fatal(err)
	}
}

func RasaTrainModel(id string, modeldir string) error {

	// os.Exit(1)
	// return
	// cmd := exec.Command("rm", "-f", modeldir+"/*")
	// if err := cmd.Run(); err != nil {
	// 	log.Fatal(err)
	// }

	cmd := RasaDockerRun("-v",
		fmt.Sprintf("%s:/app", modeldir),
		"rasa/rasa",
		"train",
	)
	// cmd.Path
	// cmd.Stdin = strings.NewReadwer("some input")
	// var out bytes.Buffer
	f, err := os.OpenFile(modeldir+"/train.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal("Failed to open out.log file", err)
	}

	cmd.Stdout = f
	var oerr bytes.Buffer
	cmd.Stderr = &oerr
	if err := cmd.Run(); err != nil {
		log.Println(oerr.String())
		return err
	}
	// log.Printf("Training model output: %q\n", out.String())
	return nil
}

func RasaRunModel(m *dbmodel.Data, modeldir string) (rerr error) {
	// os.Exit(1)
	// return
	runmutex.Lock()
	defer runmutex.Unlock()

	log.Println("Stopping container " + m.Id)
	cmd := exec.Command("docker", "stop", m.Id)
	if err := cmd.Run(); err != nil {
		log.Println(err)
	}

	time.Sleep(3 * time.Second)

	cmd = RasaDockerRun("--name", m.Id,
		"-v", fmt.Sprintf("%s:/app", modeldir),
		"-p", fmt.Sprintf("%d:5005", m.HttpPort),
		"--add-host", "myhost:172.17.0.1",
		"--rm",
		"-d",
		"rasa/rasa",
		"run",
		"-m", "/app/models",
		"--credentials", "/app/credentials.yml",
		"--enable-api",
		"--cors", "http://localhost:3000",
	)
	// cmd.Path
	// cmd.Stdin = strings.NewReadwer("some input")
	var out bytes.Buffer
	cmd.Stdout = &out
	var oerr bytes.Buffer
	cmd.Stderr = &oerr

	if err := cmd.Run(); err != nil {
		rerr = err
		log.Println(oerr.String())
		return
	}
	log.Printf("Running model output... %q\n", out.String())

	return
}
