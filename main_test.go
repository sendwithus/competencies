package main

import (
	"io/ioutil"
	"log"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestMain(m *testing.M) {
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

func TestProcessInherited(t *testing.T) {
	result, err := processInherits("#original \n##Skills\n<inherit doc=\"../test1.md\"/>\n   a  ", false)
	if err != nil {
		t.Fatal(err)
	}
	require.Equal(t, "#original \n##Skills\n<h4>test 1 skills</h4>\n\n<skills>\nbreakdancing\n</skills>\n\n<h4>test 2 skills</h4>\n\n<skills>\nfigure skating\n</skills>\n\n<h4>test 3 skills</h4>\n\n<skills>\nkung fu\n</skills>\n   a", result)
}

func TestCreateGroup(t *testing.T) {
	result, err := createGroup("10", "something")
	require.NoError(t, err)
	require.Equal(t, "<table class=\"group mt-4\"><tr><td valign=\"top\"><span class=\"group-heading text-sm pr-2 whitespace-no-wrap\">something (10 of)</span></td><td class=\"group\" valign=\"top\"> </td></tr></table>", result)
}
