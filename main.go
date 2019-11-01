package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"regexp"
	"strings"

	"github.com/russross/blackfriday"
)

func main() {
	files, err := ioutil.ReadDir("./roles")
	if err != nil {
		log.Fatal(err)
	}
	os.MkdirAll("dist/roles", os.ModePerm)

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".md") {
			fmt.Println(file.Name())
			filename := "roles/" + file.Name()
			data, _ := ioutil.ReadFile(filename)
			if err != nil {
				panic(err)
			}
			markdown, err := processSnippets(string(data))
			if err != nil {
				panic(err)
			}
			markdown, err = processInherits(markdown)
			if err != nil {
				panic(err)
			}
			markdown, err = linkSkills(markdown)
			if err != nil {
				panic(err)
			}

			html := blackfriday.Run([]byte(markdown))
			styleData, _ := ioutil.ReadFile("style.css")
			pageTitle := "title"
			preContent := `<html>
<head>
	<title>` + pageTitle + `</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style type='text/css'>` + singleLine(styleData) + `</style>
</head>
<body>
	<div id='content'>
`
			postContent := `
	</div>
</body>
</html>`
			output := preContent + string(html) + string(postContent)
			ioutil.WriteFile("dist/roles/"+file.Name()[:len(file.Name())-3]+".html", []byte(output), 0644)

		}
	}
}

func singleLine(text []byte) string {
	result := string(text)
	result = strings.ReplaceAll(result, "\n", " ")
	return result
}

func processSnippets(text string) (string, error) {
	regex := regexp.MustCompile(`<([a-z\-]+\.snippet)/>`)
	splits := regex.FindAllString(text, -1)
	for _, split := range splits {
		name := split[1 : len(split)-2]
		snippet, err := ioutil.ReadFile("snippets/" + name)
		if err != nil {
			return "", err
		}
		text = strings.ReplaceAll(text, split, string(snippet))
	}
	return text, nil
}

func processInherits(text string) (string, error) {

	regex := regexp.MustCompile(`<inherit doc="([^"]+)"/>`)
	match := regex.FindStringSubmatch(text)

	if len(match) > 0 {
		skillsGroups := []string{}
		err := processInheritsWithGroups(match[1], &skillsGroups)
		if err != nil {
			return "", err
		}
		text = strings.ReplaceAll(text, match[0], flatten(skillsGroups))
	}
	return strings.TrimSpace(text), nil
}

func flatten(skillsGroups []string) string {
	result := ""
	for _, skillGroup := range skillsGroups {
		result += skillGroup + "\n"
	}
	return strings.TrimSpace(result)
}

func processInheritsWithGroups(filename string, skillsGroups *[]string) error {
	contents, err := ioutil.ReadFile("roles/" + filename)
	if err != nil {
		return err
	}
	text := string(contents)
	skills := processSkills(filename, text)
	*skillsGroups = append(*skillsGroups, skills)

	regex := regexp.MustCompile(`<inherit doc="([^"]+)"/>`)
	match := regex.FindStringSubmatch(text)
	if len(match) > 0 {
		err = processInheritsWithGroups(match[1], skillsGroups)
		if err != nil {
			return err
		}
	}

	return nil
}

func processSkills(filename string, contents string) string {
	filename = strings.ReplaceAll(filename, ".md", ".html")
	firstLine := strings.SplitN(string(contents), "\n", 2)[0]
	regex := regexp.MustCompile(`(?s)<skills>([^<]+)</skills>`)
	match := regex.FindStringSubmatch(string(contents))
	return "#### <a href=\"" + filename + "\">" + strings.TrimSpace(firstLine[1:]) + "</a>\n" + match[0]
}

func linkSkills(contents string) (string, error) {
	group := regexp.MustCompile(`^[0-9]+ of (.+)$`)
	regex := regexp.MustCompile(`(?s)<skills>([^<]+)</skills>`)
	matches := regex.FindAllStringSubmatch(string(contents), -1)
	for _, match := range matches {
		splits := strings.Split(match[1], "\n")
		result := "<div class=\"skill-group\">"
		for _, split := range splits {
			if strings.TrimSpace(split) == "" {
				continue
			}
			groupMatches := group.FindStringSubmatch(split)
			if len(groupMatches) > 0 {
				groupResult, err := createGroup(groupMatches[1])
				if err != nil {
					return "", err
				}
				result += groupResult
			} else {
				additionalCSS := checkCompetency(split)
				result += "<a " + additionalCSS + "href=\"" + createHREF(split) + "\">" + strings.TrimSpace(split) + "</a>"
			}
		}
		result += "</div>"
		contents = strings.ReplaceAll(contents, match[0], result)
	}
	return contents, nil
}

// lazy load competencies
var competencies []string

func createGroup(group string) (string, error) {
	fmt.Println("creating group: " + group)
	result := "<div class=\"group\"><span>" + group + "</span>"
	if len(competencies) == 0 {
		fileInfos, err := ioutil.ReadDir("competencies")
		if err != nil {
			return "", err
		}
		for _, fileInfo := range fileInfos {
			competencies = append(competencies, fileInfo.Name())
		}
	}
	for _, competency := range competencies {
		if strings.HasPrefix(competency, strings.ToLower(strings.ReplaceAll(group, " ", "-"))+"-") {
			result += "<a href=\"" + createHREF(competency) + "\">" + camel(group, competency) + "</a>"
		}
	}
	result += "</div>"
	return result, nil
}

func camel(group string, competency string) string {
	competency = strings.ReplaceAll(competency, "-", " ")
	competency = strings.TrimSpace(competency[len(group) : len(competency)-3])
	return competency
}

func checkCompetency(file string) string {
	filename := "competencies/" + cleanFile(file)
	_, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return "class=\"bad\" "
	}
	return ""
}

func cleanFile(file string) string {
	file = strings.ReplaceAll(file, " - ", "-")
	file = strings.ReplaceAll(strings.TrimSpace(file), " ", "-")
	if strings.HasSuffix(file, ":2") || strings.HasSuffix(file, ":3") || strings.HasSuffix(file, ":4") {
		file = file[0 : len(file)-2]
	}
	return file + ".md"
}

func createHREF(name string) string {
	return "https://github.com/searchspring/competencies/blob/master/competencies/" + cleanFile(name)
}
