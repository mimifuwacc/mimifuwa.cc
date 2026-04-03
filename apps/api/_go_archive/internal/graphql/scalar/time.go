package scalar

import (
	"fmt"
	"io"
	"time"
)

// Time wraps time.Time for GraphQL scalar marshaling
type Time time.Time

// MarshalGQL implements graphql.Marshaler
func (t Time) MarshalGQL(w io.Writer) {
	w.Write([]byte(fmt.Sprintf("%q", time.Time(t).Format(time.RFC3339))))
}

// UnmarshalGQL implements graphql.Unmarshaler
func (t *Time) UnmarshalGQL(v interface{}) error {
	var str string
	switch s := v.(type) {
	case string:
		str = s
	case []byte:
		str = string(s)
	default:
		return fmt.Errorf("invalid time type: %T", v)
	}

	parsed, err := time.Parse(time.RFC3339, str)
	if err != nil {
		return fmt.Errorf("invalid time format: %w", err)
	}
	*t = Time(parsed)
	return nil
}

// ToTime converts scalar.Time to time.Time
func (t Time) ToTime() time.Time {
	return time.Time(t)
}

// FromTime creates scalar.Time from time.Time
func FromTime(t time.Time) Time {
	return Time(t)
}
