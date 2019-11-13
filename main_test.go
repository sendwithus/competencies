package main

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestReProcess(t *testing.T) {
	result := reProcess(`<div class="skill-group"><span id="c-languagejavascriptnode" level="1" class=" c-languagejavascriptnode competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/blob/master/competencies/language-javascript-node.md"><i class="fab fa-github"></i></a> language javascript node <a title="add this competency to the google sheet for tracking" style="display:none" class="drive-link" href="javascript:;"><i class="fab fa-google-drive"></i></a></span><table class="group"><tr><td><span class="group-heading">UI Framework (1 of)</span></td><td class="group" valign="top"> </td></tr></table><table class="group"><tr><td><span class="group-heading">IDE (1 of)</span></td><td class="group" valign="top"> <span id="c-ideintellij" level="1" class=" c-ideintellij competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/blob/master/competencies/ide-intellij.md"><i class="fab fa-github"></i></a> ide intellij <a title="add this competency to the google sheet for tracking" style="display:none" class="drive-link" href="javascript:;"><i class="fab fa-google-drive"></i></a></span><span id="c-idevim" level="1" class=" c-idevim competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/blob/master/competencies/ide-vim.md"><i class="fab fa-github"></i></a> ide vim <a title="add this competency to the google sheet for tracking" style="display:none" class="drive-link" href="javascript:;"><i class="fab fa-google-drive"></i></a></span><span id="c-idevisualstudiocode" level="1" class=" c-idevisualstudiocode competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/blob/master/competencies/ide-visual-studio-code.md"><i class="fab fa-github"></i></a> ide visual studio code <a title="add this competency to the google sheet for tracking" style="display:none" class="drive-link" href="javascript:;"><i class="fab fa-google-drive"></i></a></span></td></tr></table><span id="c-github" level="1" class=" c-github competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/blob/master/competencies/github.md"><i class="fab fa-github"></i></a> github`)
	require.Equal(t, "", result)
}

func TestProcessInherited(t *testing.T) {
	result, err := processInherits("#original \n##Skills\n<inherit doc=\"../test1.md\"/>\n   a  ", false)
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(result)
	require.Equal(t, "#original \n##Skills\n<hr><skills>\nbreakdancing\n</skills>\n<hr><skills>\nfigure skating\n</skills>\n<hr><skills>\nkung fu\n</skills>\n   a", result)
}
