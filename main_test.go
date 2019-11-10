package main

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestReProcess(t *testing.T) {
	result := reProcess(`<span id="c-oneonones" level="1" class=" c-oneonones competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/blob/master/competencies/one-on-ones.md"><i class="fab fa-github"></i></a> one on ones <a title="add this competency to the google sheet for tracking" style="display:none" class="drive-link" href="javascript:;"><i class="fab fa-google-drive"></i></a></span><span id="c-hiring" level="1" class=" c-hiring competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/blob/master/competencies/hiring.md"><i class="fab fa-github"></i></a> hiring <a title="add this competency to the google sheet for tracking" style="display:none" class="drive-link" href="javascript:;"><i class="fab fa-google-drive"></i></a></span><span id="c-interviewing" level="1" class=" c-interviewing competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/blob/master/competencies/interviewing.md"><i class="fab fa-github"></i></a> interviewing <a title="add this competency to the google sheet for tracking" style="display:none" class="drive-link" href="javascript:;"><i class="fab fa-google-drive"></i></a></span><span id="c-leading" level="1" class=" c-leading competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/blob/master/competencies/leading.md"><i class="fab fa-github"></i></a> leading <a title="add this competency to the google sheet for tracking" style="display:none" class="drive-link" href="javascript:;"><i class="fab fa-google-drive"></i></a></span><span id="c-careerdevelopment" level="1" class=" c-careerdevelopment competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/blob/master/competencies/career-development.md"><i class="fab fa-github"></i></a> career development <a title="add this competency to the google sheet for tracking" style="display:none" class="drive-link" href="javascript:;"><i class="fab fa-google-drive"></i></a></span><span id="c-visionandstrategy" level="1" class="missing c-visionandstrategy competency"><a title="go to competency github page" class="github-link" target="_blank" href="https://github.com/SearchSpring/competencies/new/master/competencies"><i class="fab fa-github"></i></a> vision and strategy <a title="add this competency to the google sheet for tracking" style="display:none" class="drive-link" href="javascript:;"><i class="fab fa-google-drive"></i></a></span><span id="c-deployments" level="2" class=" c-deployments competency"><a title="go to competency`)
	require.Equal(t, "<span id=\"c-oneonones\" level=\"1\" class=\" c-oneonones competency\"><a href=\"https://github.com/SearchSpring/competencies/blob/master/competencies/one-on-ones.md\"> one on ones </a><a href=\"https://github.com/SearchSpring/competencies/blob/master/competencies/hiring.md\"> hiring </a><a href=\"https://github.com/SearchSpring/competencies/blob/master/competencies/interviewing.md\"> interviewing </a><a href=\"https://github.com/SearchSpring/competencies/blob/master/competencies/leading.md\"> leading </a><a href=\"https://github.com/SearchSpring/competencies/blob/master/competencies/career-development.md\"> career development </a><a href=\"https://github.com/SearchSpring/competencies/new/master/competencies\"> vision and strategy </a><a title=\"add this competency to the google sheet for tracking\" style=\"display:none\" class=\"drive-link\" href=\"javascript:;\"><i class=\"fab fa-google-drive\"></i></a></span><span id=\"c-deployments\" level=\"2\" class=\" c-deployments competency\"><a title=\"go to competency", result)
}

func TestProcessInherited(t *testing.T) {
	result, err := processInherits("#original \n##Skills\n<inherit doc=\"../test1.md\"/>\n   a  ", false)
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(result)
	require.Equal(t, "#original \n##Skills\n<hr><skills>\nbreakdancing\n</skills>\n<hr><skills>\nfigure skating\n</skills>\n<hr><skills>\nkung fu\n</skills>\n   a", result)
}
