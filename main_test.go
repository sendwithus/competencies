package main

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestProcessInherited(t *testing.T) {
	result, err := processInherits("#original \n##Skills\n<inherit doc=\"../test1.md\"/>\n   a  ", false)
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(result)
	require.Equal(t, "#original \n##Skills\n<hr><skills>\nbreakdancing\n</skills>\n<hr><skills>\nfigure skating\n</skills>\n<hr><skills>\nkung fu\n</skills>\n   a", result)
}
