package diagram

import (
	"context"
	"fmt"
	"io"
	"os"

	"docker.io/go-docker"
	"docker.io/go-docker/api/types"
	"docker.io/go-docker/api/types/container"
)

func ContainerList() {
	cli, err := docker.NewEnvClient()
	if err != nil {
		panic(err)
	}

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{})
	if err != nil {
		panic(err)
	}

	for _, container := range containers {
		fmt.Printf("%s %s\n", container.ID[:10], container.Image)
	}
}

func StopContainer(containerID string) error {
	cli, err := docker.NewEnvClient()
	if err != nil {
		panic(err)
	}

	err = cli.ContainerStop(context.Background(), containerID, nil)
	if err != nil {
		panic(err)
	}
	return err
}

func RunContainerBackground() {
	ctx := context.Background()

	cli, err := docker.NewEnvClient()
	if err != nil {
		panic(err)
	}

	imageName := "rasa/rasa"

	out, err := cli.ImagePull(ctx, imageName, types.ImagePullOptions{})
	if err != nil {
		panic(err)
	}
	io.Copy(os.Stdout, out)

	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image: imageName,
	}, nil, nil, "")
	if err != nil {
		panic(err)
	}

	if err := cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		panic(err)
	}

	fmt.Println(resp.ID)
}
