package main

import (
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
	options, err := getOptions(files)
	indexHTML := ""
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".md") {
			log.Println(file.Name())
			filename := "roles/" + file.Name()
			html, title, err := processHTML(filename, options)
			if err != nil {
				panic(err)
			}
			text := processText(filename)
			htmlFilename := file.Name()[:len(file.Name())-3] + ".html"
			indexHTML += "<a href=\"" + htmlFilename + "\">" + title + "</a><br>"
			ioutil.WriteFile("docs/"+htmlFilename, []byte(html), 0644)
			ioutil.WriteFile("docs/hire-"+htmlFilename, []byte(text), 0644)
		}
	}

	ioutil.WriteFile("docs/index.html", []byte(createIndexPage(indexHTML)), 0644)
}

func getOptions(files []os.FileInfo) (string, error) {
	options := ""
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".md") {
			options += file.Name()[0:len(file.Name())-3] + ","
		}
	}
	return options, nil

}

func createIndexPage(html string) string {
	return "<html><head><title>Competency Base Role Definitions</title></head><body><h1>Competency Base Role Definitions</h1>" +
		"<p>This application displays a list of role definitions and competencies that are needed in that role.  You can sign in to google drive to attach a spreadsheet to a role that will track progress of an employee through that role.</p>" +
		"<p>Click on a role below to get started</p>" +
		html + "<footer><a style=\"position:absolute; bottom:10px;\" href=\"privacy.html\">Privacy Policy</a></footer></body></html>"
}

func tailwind(html []byte) []byte {
	htmlString := string(html)
	htmlString = strings.ReplaceAll(htmlString, "<h1>", `<h1 class="whitespace-no-wrap top-0 left-0 fixed w-full block opacity-90 bg-white p-2 px-8 border-b-2 text-lg mb-4">`)
	htmlString = strings.ReplaceAll(htmlString, "<h2>", `<h2 class="px-2 text-2xl mt-4">`)
	htmlString = strings.ReplaceAll(htmlString, "<h3>", `<h3 class="px-2 text-xl mt-2">`)
	htmlString = strings.ReplaceAll(htmlString, "<p>", `<p style="width:50rem" class="px-2">`)
	return []byte(htmlString)
}
func processHTML(filename string, options string) (string, string, error) {
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		panic(err)
	}
	markdown := string(data)
	title := getTitle(markdown)
	markdown, err = processInherits(markdown, false)
	if err != nil {
		panic(err)
	}
	markdown, err = linkSkills(markdown)
	if err != nil {
		panic(err)
	}
	html := blackfriday.Run([]byte(markdown))
	html = tailwind(html)
	appData, _ := ioutil.ReadFile("app.js")
	styleData, _ := ioutil.ReadFile("style.css")
	preContent := `<html> 
<head>
<title>` + title + `</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style type='text/css'>` + singleLine(styleData) + `</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js" integrity="sha256-1A78rJEdiWTzco6qdn3igTBv9VupN3Q1ozZNTR4WE/Y=" crossorigin="anonymous"></script>

<script src="https://apis.google.com/js/api.js"></script>
<link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon"> 
<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" integrity="sha256-+N4/V/SbAFiW1MPBCXnfnP9QSN3+Keu+NlB+0ev/YKQ=" crossorigin="anonymous" />
</head>
<body>
<div id='content'>
`
	postContent := "</div></body><script>\nlet options='" + options + "';\n" + string(appData) + "\n</script></html>"
	output := preContent + string(html) + string(postContent)
	return output, title, nil
}

func processText(filename string) string {
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		panic(err)
	}

	markdown, err := processSnippets(string(data))
	if err != nil {
		panic(err)
	}
	markdown, err = processInherits(markdown, true)
	if err != nil {
		panic(err)
	}
	markdown, err = linkSkills(markdown)
	if err != nil {
		panic(err)
	}
	markdown = reProcess(markdown)
	html := string(blackfriday.Run([]byte(markdown)))
	html = googleHireify(html)
	appData, _ := ioutil.ReadFile("app-hire.js")
	preContent := `<html> 
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
<link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon"> 
</head>
<body>
<div id='content'>
`
	postContent := "</div></body><script>" + string(appData) + "\n</script></html>"
	html = preContent + html + string(postContent)
	return string(html)
}

func googleHireify(html string) string {
	html = strings.ReplaceAll(strings.ReplaceAll(html, "<h1>", "<strong>"), "</h1>", "</strong><br><br>")
	html = strings.ReplaceAll(strings.ReplaceAll(html, "<h2>", "<strong>"), "</h2>", "</strong><br>")
	html = strings.ReplaceAll(strings.ReplaceAll(html, "<h3>", "<strong>"), "</h3>", "</strong><br>")
	html = strings.ReplaceAll(strings.ReplaceAll(html, "<b>", "<strong>"), "</b>", "</strong>")
	html = strings.ReplaceAll(html, "</p>", "</p><br>")
	// html = strings.ReplaceAll(html, ": level 2", "")
	// html = strings.ReplaceAll(html, ": level 3", "")
	// html = strings.ReplaceAll(html, ": level 4", "")
	// html = strings.ReplaceAll(html, ": level 5", "")
	// html = strings.ReplaceAll(html, ": level 6", "")
	html = strings.ReplaceAll(html, "<hr>", "")
	html = strings.ReplaceAll(html, "<hr />", "")
	html = strings.ReplaceAll(html, "<table", "<br><table")
	html = strings.ReplaceAll(html, "</table>", "</table>\n\n<br>")
	return html
}

func reProcess(markdown string) string {
	regex := regexp.MustCompile(`<a href="([^"]+)"[^>]*><i class="fab hover:opacity-75 fa-github"></i></a>([^<]+)`)
	matches := regex.FindAllStringSubmatch(markdown, -1)
	for _, match := range matches {
		markdown = strings.ReplaceAll(markdown, match[0], " <a href=\""+match[1]+"\">"+strings.TrimSpace(match[2])+"</a>, ")
	}
	return markdown
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
	splits := regex.FindAllStringSubmatch(text, -1)
	for _, split := range splits {
		name := split[1]
		snippet, err := ioutil.ReadFile("snippets/" + name)
		if err != nil {
			panic(err)
		}
		text = strings.ReplaceAll(text, split[0], string(snippet))
	}
	return text, nil
}

func processInherits(text string, skipBase bool) (string, error) {

	regex := regexp.MustCompile(`<inherit doc="([^"]+)"/>`)
	match := regex.FindStringSubmatch(text)
	if len(match) > 0 {
		if match[1] == "base.md" && skipBase {
			return strings.ReplaceAll(text, match[0], ""), nil
		}
		skillsGroups := []string{}
		err := processInheritsWithGroups(match[1], skipBase, &skillsGroups)
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

func processInheritsWithGroups(filename string, skipBase bool, skillsGroups *[]string) error {
	contents, err := ioutil.ReadFile("roles/" + filename)
	if err != nil {
		return err
	}
	text := string(contents)
	skills := processSkills(text)
	*skillsGroups = append(*skillsGroups, skills)

	regex := regexp.MustCompile(`<inherit doc="([^"]+)"/>`)
	match := regex.FindStringSubmatch(text)
	if len(match) > 0 {
		if match[1] == "base.md" && skipBase {
			return nil
		}
		err = processInheritsWithGroups(match[1], skipBase, skillsGroups)
		if err != nil {
			return err
		}
	}

	return nil
}

func processSkills(contents string) string {
	regex := regexp.MustCompile(`(?s)<skills>([^<]+)</skills>`)
	match := regex.FindStringSubmatch(string(contents))
	return match[0]
}

func linkSkills(contents string) (string, error) {
	group := regexp.MustCompile(`^([0-9]+) of (.+)$`)
	regex := regexp.MustCompile(`(?s)<skills>([^<]+)</skills>`)
	matches := regex.FindAllStringSubmatch(string(contents), -1)
	for _, match := range matches {
		splits := strings.Split(match[1], "\n")
		result := `<div class="skill-group p-4 bg-white shadow-xl mb-4 rounded-lg">`
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
	drive := " <a href=\"javascript:;\" title=\"add this competency to the google sheet for tracking\" style=\"display:none\" class=\"drive-link hover:opacity-75\"><i class=\"fas hover:opacity-75 ml-1 fa-plus\"></i></a>"
	if check {
		exists := checkCompetency(name)
		if !exists {
			classes += "missing"
			href = "https://github.com/SearchSpring/competencies/new/master/competencies"
		}
	}
	github := "<a href=\"" + href + "\" title=\"go to competency github page\" class=\"github-link\" target=\"_blank\"><i class=\"fab hover:opacity-75 fa-github\"></i></a> "
	classes += " " + name2Id(name)
	classes += " competency inline-block rounded-full bg-gray-300 p-1 px-2 mr-2 mb-2 text-xs whitespace-no-wrap"

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
	group, _ = getLevelFromName(group)

	result := "<table class=\"group mt-4\"><tr><td valign=\"top\"><span class=\"group-heading text-sm pr-2 whitespace-no-wrap\">" + group + " (" + count + " of)" + "</span></td><td class=\"group\" valign=\"top\"> "
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
			result += link
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
	return strings.ToLower(file) + ".md"
}

func createHREF(name string) string {
	return "https://github.com/SearchSpring/competencies/blob/master/competencies/" + cleanFile(name)
}
