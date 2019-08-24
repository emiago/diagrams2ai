package storage

import (
	log "github.com/sirupsen/logrus"

	"github.com/go-redis/redis"
)

var Redis *redis.Client

func InitRedisClient() {
	client := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	pong, err := client.Ping().Result()
	if err != nil {
		log.Fatal(pong, err)
	}

	Redis = client

}

func GetKeys(pattern string) []string {
	c := Redis.Keys(pattern)
	res, _ := c.Result()
	return res
}
