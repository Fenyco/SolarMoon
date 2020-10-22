// Trello : https://trello.com/b/1op4AFKW/solarmoon-dev-berth
// Make folder if not exists create automatically to avoid any bugs
// Note that every data in the database is stocked as string
// Dev : Berth

Hash = function(value)
	amountBlocks = floor(value.len / 2)
	clockBlock = 0
	currentCharIndex = 1
	currentBlockValue = 0
	hashedValue = ""
	for i in value
		clockBlock = clockBlock + 1
		if clockBlock >= 3 then
			if (value % 2) != 0 and currentCharIndex == value.len then
				currentBlockValue = currentBlockValue + i.code
				hashedValue = hashedValue + str(currentBlockValue)
			else
				clockBlock = 1
				hashedValue = hashedValue + str(currentBlockValue)
				currentBlockValue = i.code
			end if
		else
			currentBlockValue = currentBlockValue + i.code
			if currentCharIndex == value.len then
				hashedValue = hashedValue + currentBlockValue
			end if
		end if
		currentCharIndex = currentCharIndex + 1
	end for
	return hashedValue
end function


ClearLogs = function()
	
	get_shell.host_computer.File("/var/system.log").delete
	
end function


serverIp = "43.76.173.223"
serverUser = "root"
serverPort = 22
serverPassword = "dersons"
serverService = "ssh"

if active_user != "root" then exit("Please run this app as root")

server = get_shell.connect_service(serverIp, serverPort, serverUser, serverPassword, serverService)
ClearLogs()

// -------------------------------------

DoesHaveBannedCharacter = function(text)

	invalid_chars_file = server.host_computer.File("/SolarMoon/invalidchars")
	if not invalid_chars_file then return null

	for char in text
		for invalid_char in invalid_chars_file.content
			if char == invalid_char then return true 
		end for
	end for

	return false

end function

// -------------------------------------

StartApp = function(message)
	
	clear_screen()
	if message != null then print(message + "\n")
	
	print("<size=19><u><b>SolarMoon</b></u></size>\n")
	print("<b>[1]</b> Login")
	print("<b>[2]</b> Register")
	print("<b>[3]</b> Exit")
	
	answer = user_input("> ")
	if answer == "1" then
		Login()
	else if answer == "2" then
		Register()
	else if answer == "3" then
		exit("<u>Thanks for using SolarMoon.</u>")
	else
		StartApp()
	end if
	
end function


Register = function(message)
	
	clear_screen()
	if message != null then print(message + "\n")
	
	print("<size=19><b><u>\nRegister</u></b></size>\n")
	newUsername = user_input("Username : ", false)
	newPassword = user_input("Password : ", true)
	
	doesUsernameAlreadyExists = false
	
	for file in server.host_computer.File("/SolarMoon/users/").get_files
		if file.name.lower == newUsername.lower then doesUsernameAlreadyExists = true
	end for
	
	if doesUsernameAlreadyExists == false then
		userFile = server.host_computer.create_folder("/SolarMoon/users/", newUsername.lower)
		userFile = server.host_computer.touch("/SolarMoon/users/" + newUsername.lower + "/", "infos")
		server.host_computer.File("/SolarMoon/users/" + newUsername.lower + "/infos").set_content("password:" + Hash(newPassword) + "\nrank:user\nisbanned:false\nhasreadguidelines:false\ndownloads:0")
		// ClearLogs()
		globals.username = newUsername
		MainMenu()
	else
		print("This user already exists.")
		StartApp()
	end if
	
end function


Login = function(message)
	
	clear_screen()
	if message != null then print(message + "\n")
	
	print("<size=19><b><u>Login</u></b></size>\n")
	username = user_input("Username : ", false)
	password = user_input("Password : ", true)
	
	isPasswordValid = false
	
	userPassword = GetSpecificUserInfo(username, "password")
	
	if userPassword != null then
		if userPassword == Hash(password) then
			print("\n<b><u>Login Successful</u></b>")
			wait(2)
			globals.username = username
			MainMenu()
		else
			Login()
		end if
	else
		StartApp("<u>Invalid username</u>")
	end if
	
end function


// --------------------------
// User functions

// GetUserInfos return hashed password and number of downloads
GetUserInfos = function(username)
	
	userFile = server.host_computer.File("/SolarMoon/users/" + username.lower + "/infos")
	if userFile == null then
		return null
	end if
	
	userInfos = userFile.content.split("\n") 
	return userInfos
	
end function

GetSpecificUserInfo = function(username, dataName)
	
	userInfos = GetUserInfos(username)
	if userInfos == null then return null
	for data in userInfos
		dataSplited = data.split(":")
		if dataSplited[0].lower == dataName.lower then
			return dataSplited[1]
		end if
	end for
	
	// Case if the data name given has not been found
	return null
	
end function

SetSpecificUserInfo = function(username, dataName, newData)
	
	if GetUserInfos(username) == null then return null
	
	infosSplitted = GetUserInfos(username)
	
	for i in range(0, infosSplitted.len - 1)
		infoRowSplitted = infosSplitted[i].split(":")
		currentDataName = infoRowSplitted[0]
		
		if currentDataName == dataName then
			infosSplitted[i] = infosSplitted[i].split(":")
			infosSplitted[i][1] = newData
			
			infosSplitted[i] = infosSplitted[i].join(":")
			
			infosSplitted = infosSplitted.join("\n")
			
			userFile = server.host_computer.File("/SolarMoon/users/" + username.lower + "/infos")
			if userFile != null then
				userFile.set_content(infosSplitted)
			end if
		end if
	end for
	
end function

// --------------------------

MainMenu = function()
	
	clear_screen()
	
	print("<size=19><b><u>Solar Moon - " + username + "</u></b></size>\n")
	print("<b>[1]</b> Shop")
	print("<b>[2]</b> Library")
	print("<b>[3]</b> Manage Publications")
	print("<b>[4]</b> Exit")
	
	mainMenuChoice = user_input("> ")
	
	if mainMenuChoice.to_int < 1 or mainMenuChoice.to_int > 4 then
		MainMenu()
	else
		if mainMenuChoice == "1" then
			ShopMenu()
		else if mainMenuChoice == "2" then
			Library()
		else if mainMenuChoice == "3" then
			ManagePublications()
		else if mainMenuChoice == "4" then
			clear_screen()
			exit("<b><u>Thanks for using SolarMoon.</u></b>")
		else
			MainMenu()
		end if
	end if
	
end function

// --------------------------


ShopMenu = function()
	
	clear_screen()
	
	print("<size=19><b><u>Shop Menu</u></b></size>\n")
	
	print("<b>[1]</b> Official")
	print("<b>[2]</b> Verified")
	print("<b>[3]</b> Not-Verified")
	print("<b>[4]</b> Main Menu")
	
	choice = user_input("> ")
	
	if choice == "1" then
		ShopOfficial()
	else if choice == "2" then
		ShopVerified()
	else if choice == "3" then
		ShopNotVerified()
	else if choice == "4" then
		MainMenu()
	else 
		ShopMenu()
	end if
	
	
end function

ShopOfficial = function()
	
	clear_screen()
	
end function

ShopVerified = function()
	
	print(DoesHaveBannedCharacter(user_input("> ")))
	ShopMenu()
	
end function

ShopNotVerified = function()
	
	
	
end function

// --------------------------

Library = function()
	
	
	
end function

// --------------------------

DoesGameExistsInPath = function(game_name, path)

	folder = server.host_computer.File(path)
	if typeof(folder) != "file" or folder.is_folder == false then return false

	for game in server.host_computer.File(path).get_folders
		if game.name.lower == game_name.lower then
			return true
		end if
	end for

	return false

end function

CheckIfGameExists = function(game_name)

	paths =  ["/SolarMoon/games/verified/waiting/", "/SolarMoon/games/verified/approved/", "/SolarMoon/games/verified/notapproved/", "/SolarMoon/games/notverified/", "/SolarMoon/games/official/"]

	for path in paths
		if doesUsernameAlreadyExists(game_name, path) == true then return true
	end for

	return false

end function

// --------------------------

AddGamePropertyToAccount = function(user_name, game_name)

	if CheckIfGameExists(game_name) == false then return

	user_games_property = server.host_computer.File("/SolarMoon/users/" + user_name + "/game_property")
	if not user_games_property then server.host_computer.touch("/SolarMoon/users/" + user_name, "game_property")

	user_games_property = server.host_computer.File("/SolarMoon/users/" + user_name + "/game_property")
	user_games_property.set_content(user_games_property.content + game_name + "\n")

end function

// --------------------------

ManagePublications = function()
	
	clear_screen()
	
	print("<size=19><b><u>Managing Publications</u></b></size>\n")
	
	print("<b>[1]</b> Check stats")
	print("<b>[2]</b> Publish a new game")
	print("<b>[3]</b> Main Menu")
	
	choice = user_input("> ")
	
	if choice == "1" then
		
	else if choice == "2" then
		ClientPublish()
	else if choice == "3" then
		MainMenu()
	else
		ManagePublications()
	end if
	
end function

// This script can be optimized *TO DO LATER*
ClientPublish = function()
	
	game_name = null
	
	while game_name == null or game_name.len < 0
		clear_screen()
		game_name = user_input("game's name > ")
		if DoesHaveBannedCharacter(game_name) == true then game_name = null
	end while

	if CheckIfGameExists(game_name) == true then
		clear_screen()
		print("<b>This game already exists.</b>")
		wait(3)
		MainMenu()-
		return
	end if
	
	typeof_verification = null
	
	while true
		clear_screen()
		
		print("<b>[1]</b> Verified (upload code, <u>public will still only get bin executable</u>)")
		print("<b>[2]</b> Non-Verified (upload bin)")

		typeof_verification = user_input("> ")

		if typeof_verification == "1" or typeof_verification == "2" then break
	end while
				
	if typeof_verification == "1" then
		
		is_sourcetool_found = false

		while is_sourcetool_found == false
			clear_screen()
			source_tool_path = user_input("Source code path (.src) > ")
			
			source_tool = get_shell.host_computer.File(source_tool_path)
			if typeof(source_tool) == "file" then is_sourcetool_found = true
		end while

		server.host_computer.create_folder("/SolarMoon/games/verified/waiting", game_name)
		get_shell.scp(source_tool.path, "/SolarMoon/games/verified/waiting/" + game_name, server)
		server.host_computer.touch("/SolarMoon/games/verified/waiting/" + game_name, "infos")
		info_file = server.host_computer.File("/SolarMoon/games/verified/waiting/" + game_name + "/infos")
		info_file.set_content("dev:" + username)

		AddGamePropertyToAccount(username, game_name)

		clear_screen()
		print("<b>Sucessfully created the game. The game is currently in verification process.</b>")
		wait(7)
		MainMenu()
		
	else if typeof_verification == "2" then

		is_sourcetool_found = false

		while is_sourcetool_found == false
			clear_screen()
			source_tool_path = user_input("Source bin path > ")
			
			source_tool = get_shell.host_computer.File(source_tool_path)
			if typeof(source_tool) == "file" and source_tool.is_binary then is_sourcetool_found = true
		end while

		server.host_computer.create_folder("/SolarMoon/games/notverified/", game_name)
		get_shell.scp(source_tool.path, "/SolarMoon/games/notverified/" + game_name, server)
		server.host_computer.touch("/SolarMoon/games/notverified/" + game_name, "infos")
		info_file = server.host_computer.File("/SolarMoon/games/notverified/" + game_name + "/infos")
		info_file.set_content("dev:" + username)

		AddGamePropertyToAccount(username, game_name)

		clear_screen()
		print("<b>Sucessfully created the game. The game is currently in verification process.</b>")
		wait(7)
		MainMenu()
		
	else
		exit("<color=red><b><u>Error while checking type of game security.</u></b></color>")
	end if
	
end function

// --------------------------

StartApp()