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
	os.MkdirAll("docs", os.ModePerm)

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".md") {
			fmt.Println(file.Name())
			filename := "roles/" + file.Name()
			html, title, err := processFile(filename)
			if err != nil {
				panic(err)
			}
			styleData, _ := ioutil.ReadFile("style.css")
			appData, _ := ioutil.ReadFile("app.js")
			preContent := `<html>
<head>
	<title>` + title + `</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style type='text/css'>` + singleLine(styleData) + `</style>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js" integrity="sha256-1A78rJEdiWTzco6qdn3igTBv9VupN3Q1ozZNTR4WE/Y=" crossorigin="anonymous"></script>
	
	<script src="https://apis.google.com/js/api.js"></script>
	<link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon"> 
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" integrity="sha256-+N4/V/SbAFiW1MPBCXnfnP9QSN3+Keu+NlB+0ev/YKQ=" crossorigin="anonymous" />
</head>
<body>
	<div id='content'>
`
			postContent := "</div></body><script>\n" + string(appData) + "\n</script></html>"
			output := preContent + html + string(postContent)
			ioutil.WriteFile("docs/"+file.Name()[:len(file.Name())-3]+".html", []byte(output), 0644)

		}
	}
}

func processFile(filename string) (string, string, error) {
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		panic(err)
	}
	markdown, err := processSnippets(string(data))
	if err != nil {
		panic(err)
	}
	title := getTitle(markdown)
	markdown, err = processInherits(markdown)
	if err != nil {
		panic(err)
	}
	markdown, err = linkSkills(markdown)
	if err != nil {
		panic(err)
	}
	html := blackfriday.Run([]byte(markdown))
	return string(html), title, nil
}

func getTitle(content string) string {
	return strings.TrimSpace(strings.Split(content, "\n")[0][1:])
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
	return "\n#### <a href=\"" + filename + "\">" + strings.TrimSpace(firstLine[1:]) + "</a>\n" + match[0]
}

func linkSkills(contents string) (string, error) {
	group := regexp.MustCompile(`^([0-9]+) of (.+)$`)
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
				groupResult, err := createGroup(groupMatches[1], groupMatches[2])
				if err != nil {
					return "", err
				}
				result += groupResult
			} else {
				result += createSkillLink(split, true)
			}
		}
		result += "</div>"
		contents = strings.ReplaceAll(contents, match[0], result)
	}
	return contents, nil
}

func createSkillLink(name string, check bool) string {
	name = strings.ReplaceAll(name, "-", " ")
	name, level := getLevelFromName(name)
	classes := ""
	href := createHREF(name)
	github := "<a title=\"go to competency github page\" class=\"github-link\" target=\"_blank\" href=\"" + href + "\"><i class=\"fab fa-github\"></i></a> "
	drive := " <a title=\"add this competency to the google sheet for tracking\" style=\"display:none\" class=\"drive-link\" href=\"javascript:;\"><i class=\"fab fa-google-drive\"></i></a>"
	if check {
		exists := checkCompetency(name)
		if !exists {
			classes += "missing"
			href = "https://github.com/SearchSpring/competencies/new/master/competencies"
		}
	}
	classes += " " + name2Id(name)
	classes += " competency"

	return "<span id=\"" + name2Id(name) + "\" level=\"" + level + "\" class=\"" + classes + "\">" + github +
		strings.ToLower(strings.TrimSpace(name)) + makeLevel(level) +
		drive +
		"</span>"
}

func name2Id(name string) string {
	return "c-" + strings.ToLower(strings.ReplaceAll(strings.ReplaceAll(name, " ", ""), "-", ""))
}

func getLevelFromName(name string) (string, string) {
	level := "1"
	index := strings.Index(name, ":")

	if index != -1 {
		level = name[index+1:]
		name = name[0:index]
	}
	return name, level
}

// lazy load competencies
var competencies []string

func createGroup(count string, group string) (string, error) {
	fmt.Println("creating group: " + group)
	group, _ = getLevelFromName(group)

	result := "<table class=\"group\"><tr><td><span class=\"group-heading\">" + group + " (" + count + " of)" + "</span></td><td class=\"group\" valign=\"top\"> "
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
			competency = competency[0 : len(competency)-3]
			link := createSkillLink(competency, false)
			result += link //  "<a href=\"" + createHREF(competency) + "\">" + camel(group, competency) + makeLevel(level) + "</a>"
		}
	}
	result += "</td></tr></table>"
	return result, nil
}
func makeLevel(level string) string {
	if level == "1" {
		return ""
	}
	return ": level " + level
}

func camel(group string, competency string) string {
	competency = strings.ReplaceAll(competency, "-", " ")
	competency = strings.TrimSpace(competency[len(group) : len(competency)-3])
	return competency
}

func checkCompetency(file string) bool {
	filename := "competencies/" + cleanFile(file)
	_, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return true
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
	return "https://github.com/SearchSpring/competencies/blob/master/competencies/" + cleanFile(name)
}
