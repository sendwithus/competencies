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
	require.Equal(t, "#original \n##Skills\n<skills>\nbreakdancing\n</skills>\n<skills>\nfigure skating\n</skills>\n<skills>\nkung fu\n</skills>\n   a", result)
}
