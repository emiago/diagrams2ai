package main

import (
	"diagrams2ai/actionhook"
	"diagrams2ai/config"
	"diagrams2ai/diagram"
	"diagrams2ai/storage"
	"log"
	"net/http"
	"os"
	"os/user"

	"github.com/gorilla/mux"
)

var (
	CONFIGURATION_FILE = "/etc/diagrams2ai"
)

func main() {
	if _, err := os.Stat(CONFIGURATION_FILE); err == nil {
		if err := config.InitConfig(CONFIGURATION_FILE); err != nil {
			log.Fatal(err)
		}
	}

	storage.InitRedisClient()

	router := mux.NewRouter()

	user, err := user.Current()
	if err != nil {
		panic(err)
	}

	// Current User
	log.Println("Hi " + user.Name + " (id: " + user.Uid + ")")
	// originsOk := handlers.AllowedOrigins([]string{"*"})
	// methodsOk := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"})
	// headersOk := handlers.AllowedHeaders([]string{"Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"})
	// contentOk := handlers.ContentTypeHandler([]string{"*"})
	router.HandleFunc("/models/list", corsHandler(diagram.ModelsListHandler))
	router.HandleFunc("/model/save", corsHandler(diagram.ModelSaveHandler))
	router.HandleFunc("/model/load", corsHandler(diagram.ModelLoadHandler))
	router.HandleFunc("/model/train", corsHandler(diagram.ModelTrainHandler))
	router.HandleFunc("/model/run", corsHandler(diagram.ModelRunHandler))

	router.HandleFunc("/action", corsHandler(actionhook.ActionHookHandler))
	log.Println("Started listening...")
	// handlers.
	// log.Fatal(http.ListenAndServe(":5000", handlers.CORS(originsOk, headersOk)(router)))
	log.Fatal(http.ListenAndServe(":5000", router))
}

func corsHandler(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// x, err := httputil.DumpRequest(r, true)
		// if err != nil {
		// 	http.Error(w, fmt.Sprint(err), http.StatusInternalServerError)
		// 	return
		// }
		// log.Printf("%s\n", x)

		w.Header().Set("Access-Control-Allow-Origin", "*")

		if r.Method == "OPTIONS" {
			//handle preflight in here
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		} else {
			h(w, r)
			// rec := httptest.NewRecorder()
			// rec.Header().Set("Content-Type", "application/json")
			// h(rec, r)
			// log.Printf("%s\n%d\n", helpers.JSONIndent(rec.Body.Bytes()), rec.Code)

			// w.WriteHeader(rec.Code)
			// rec.Body.WriteTo(w)
		}
	}
}

// func enableCors(w *http.ResponseWriter) {
// 	(*w).Header().Set("Access-Control-Allow-Origin", "*")
// }
