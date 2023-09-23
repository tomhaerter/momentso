package helper

import (
	"fmt"
	"io"

	"github.com/99designs/gqlgen/graphql"
	"github.com/sqids/sqids-go"
)

var sq *sqids.Sqids

func init() {
	var err error

	sq, err = sqids.New(
		sqids.Options{
			Alphabet:  "cFZgQXVAyCNDnK2bB8MxdG51qvWujO7mUpeilPk6aIsTEhw3LSJoH9rzt0fY4R",
			MinLength: 8,
		},
	)
	if err != nil {
		panic(err)
	}
}

func MarshalID(i int64) graphql.Marshaler {
	id, err := sq.Encode([]uint64{uint64(i)})
	if err != nil {
		panic(err)
	}

	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = w.Write([]byte{'"'})
		_, _ = w.Write([]byte(id))
		_, _ = w.Write([]byte{'"'})
	})
}

func UnmarshalID(v interface{}) (int64, error) {
	switch v := v.(type) {
	case string:
		id := sq.Decode(v)
		if len(id) != 1 {
			return 0, fmt.Errorf("invalid id %s", v)
		}

		return int64(id[0]), nil
	case int:
		return int64(v), nil
	default:
		return 0, fmt.Errorf("%T is not a bool", v)
	}

}
