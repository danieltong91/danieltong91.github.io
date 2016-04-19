import webbrowser

url = 'http://localhost:8000'

# chrome_path = 'open -a /Applications/Google\ Chrome.app %s'
chrome_path = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe %s'

webbrowser.get(chrome_path).open(url)