package helpers

import (
	"bytes"
	"encoding/json"
)

func JSONIndent(body []byte) string {
	var prettyJSON bytes.Buffer
	json.Indent(&prettyJSON, body, "", "\t")
	return string(prettyJSON.Bytes())
}
