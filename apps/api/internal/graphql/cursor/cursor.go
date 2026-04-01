package cursor

import (
	"encoding/base64"
	"encoding/json"
	"time"
)

// Cursor represents a pagination cursor
type Cursor struct {
	ID      int64     `json:"id"`
	Created time.Time `json:"created"`
}

// Encode creates a cursor string from id and created time
func Encode(id int64, created time.Time) string {
	c := Cursor{ID: id, Created: created}
	b, _ := json.Marshal(c)
	return base64.URLEncoding.EncodeToString(b)
}

// Decode parses a cursor string
func Decode(cursor string) (*Cursor, error) {
	b, err := base64.URLEncoding.DecodeString(cursor)
	if err != nil {
		return nil, err
	}
	var c Cursor
	err = json.Unmarshal(b, &c)
	return &c, err
}
