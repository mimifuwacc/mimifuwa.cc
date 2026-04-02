package cursor

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
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

// MarshalGQL implements graphql.Marshaler for Cursor scalar
func (c Cursor) MarshalGQL(w io.Writer) {
	b, _ := json.Marshal(c)
	encoded := base64.URLEncoding.EncodeToString(b)
	w.Write([]byte(fmt.Sprintf("%q", encoded)))
}

// UnmarshalGQL implements graphql.Unmarshaler for Cursor scalar
func (c *Cursor) UnmarshalGQL(v interface{}) error {
	var str string
	switch s := v.(type) {
	case string:
		str = s
	case []byte:
		str = string(s)
	default:
		return fmt.Errorf("invalid cursor type: %T", v)
	}

	b, err := base64.URLEncoding.DecodeString(str)
	if err != nil {
		return fmt.Errorf("invalid cursor encoding: %w", err)
	}

	var parsed Cursor
	if err := json.Unmarshal(b, &parsed); err != nil {
		return fmt.Errorf("invalid cursor JSON: %w", err)
	}

	*c = parsed
	return nil
}
