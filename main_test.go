package main

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestProcessInherited(t *testing.T) {
	result, err := processInherits("#original \n##Skills\n<inherit doc=\"../test1.md\"/>\n   a  ")
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(result)
	require.Equal(t, "#original \n##Skills\n#### <a href=\"../test1.html\">test 1</a>\n<skills>\nbreakdancing\n</skills>\n\n#### <a href=\"../test2.html\">test 2</a>\n<skills>\nfigure skating\n</skills>\n\n#### <a href=\"../test3.html\">test 3</a>\n<skills>\nkung fu\n</skills>\n   a", result)
}

func TestProcessInheritedAndMarkdownification(t *testing.T) {
	html, title, err := processFile("test1.md")
	if err != nil {
		panic(err)
	}
	require.Equal(t, "test 1", title)
	require.Equal(t, "<h1>test 1</h1>\n\n<h2>Test document with sub skills</h2>\n\n<div class=\"skill-group\"><a class=\"bad\" href=\"https://github.com/searchspring/competencies/blob/master/competencies/breakdancing.md\">breakdancing</a></div>\n\n<h2>comment that shouldn&rsquo;t appear</h2>\n\n<h4><a href=\"../test2.html\">test 2</a></h4>\n\n<div class=\"skill-group\"><a class=\"bad\" href=\"https://github.com/searchspring/competencies/blob/master/competencies/figure-skating.md\">figure skating</a></div>\n\n<h4><a href=\"../test3.html\">test 3</a></h4>\n\n<div class=\"skill-group\"><a class=\"bad\" href=\"https://github.com/searchspring/competencies/blob/master/competencies/kung-fu.md\">kung fu</a></div>\n\n<p>a</p>\n", string(html))
}
