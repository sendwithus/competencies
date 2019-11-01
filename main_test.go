package main

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestProcessInherited(t *testing.T) {
	result, err := processInherits("#original \n##Skills\n<inherit doc=\"../test1.md\"/>\n")
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(result)
	require.Equal(t, "#original \n##Skills\n#### test 1\n<skills>\nbreakdancing\n</skills>\n#### test 2\n<skills>\nfigure skating\n</skills>", result)
}
