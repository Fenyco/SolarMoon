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

if params == null or params.len < 2 then exit("<b>usage: </b>workspace <username> <password>")
if active_user != "root" then exit("Please run this app as root")

username = params[0]
password = params[1]

// ----------------------

ClearLogs = function()
	
	get_shell.host_computer.File("/var/system.log").delete
	
end function

serverIp = "163.27.56.162"
serverUser = "root"
serverPort = 22
serverPassword = "asmilly"
serverService = "ssh"

server = get_shell.connect_service(serverIp, serverPort, serverUser, serverPassword, serverService)
ClearLogs()

// ----------------------

GetUserInfos = function(userName)
	
	userFile = server.host_computer.File("/Workspace/users/" + userName.lower + "/data")
	if userFile == null then
		return null
	end if
	
	userInfos = userFile.content.split("\n") 
	return userInfos
	
end function

GetSpecificUserInfo = function(username, dataName)

    userInfos = GetUserInfos(username)
    for data in userInfos
        dataSplited = data.split(":")
        if dataSplited[0].lower == dataName.lower then
            return dataSplited[1]
        end if
    end for

    // Case if the data name given has not been found
    return null

end function

// ----------------------

MainMenu = function()

	userWorkspaces = server.host_computer.File("/Workspace/users/" + username.lower + "/workspaces").content.split("\n") 

    print("\n<b><u><size=19>Workspaces - " + username + "</size></u></b>")
    for i in range(0, userWorkspaces.len - 1)
        print("<b>[" + (i + 1) + "]</b> " + userWorkspaces[i])
    end for
    print("<b>[" + (userWorkspaces.len + 1) + "]</b> " + "Exit")

	mainMenuChoice = user_input("Choice : ").to_int
	if mainMenuChoice >= 1 and mainMenuChoice <= userWorkspaces.len then
		print("Opening " + userWorkspaces[mainMenuChoice - 1] + "...")
		OpenWorkspace(userWorkspaces[mainMenuChoice - 1])
	else if mainMenuChoice == userWorkspaces.len + 1 then
		exit("Have a good day !")
	else
		print("\n<u>Invalid choice</u>")
		MainMenu()
	end if

end function

// ----------------------

OpenWorkspace = function(workspace)

	print("\n<b><u><size=19>" + workspace + "</u></b></size>")
	workspaceMainFolder = server.host_computer.File("/Workspace/workspaces/" + workspace)
	if workspaceMainFolder == null then
		exit("<b><u>Workspace not found, please contact an admin.</u></b>")
	end if
	workspaceFiles = workspaceMainFolder.get_files

	// print("Choose wich file you want to edit.")
	if workspaceFiles.len > 0 then
		for i in range(0, workspaceFiles.len - 1)
			print("<b>[" + (i + 1) + "]</b> " + workspaceFiles[i].name)
		end for
	end if

	print("<b>[" + (workspaceFiles.len + 1) + "]</b> <color=yellow>Create file</color>") // Option to create a file
	print("<b>[" + (workspaceFiles.len + 2) + "]</b> <color=yellow>Download all the workspace</color>")
	print("<b>[" + (workspaceFiles.len + 3) + "]</b> <color=yellow>Upload a file to the workspace</color>")
	print("<b>[" + (workspaceFiles.len + 4) + "]</b> <color=yellow>Push to origin</color>")
	print("<b>[" + (workspaceFiles.len + 5) + "]</b> <color=yellow>Return to main menu file</color>") // Option to return to main menu

	choice = user_input("Choice : ").to_int

	if choice >= 1 and choice <= workspaceFiles.len then
		ManipulateFile(workspace, workspaceFiles[choice - 1])
	else if choice == workspaceFiles.len + 1 then
		newFileName = user_input("New file's name : ")
		server.host_computer.touch("/Workspace/workspaces/" + workspace + "/", newFileName)
		OpenWorkspace(workspace)
	else if choice == workspaceFiles.len + 2 then
		for workspaceFile in workspaceFiles
			DownloadFile(workspace, workspaceFile, false)
		end for
		print("\nDownloaded all the workspace.")
		OpenWorkspace(workspace)
	else if choice == workspaceFiles.len + 3 then
		UploadFile(workspace)
	else if choice == workspaceFiles.len + 4 then
		if get_shell.host_computer.File("/Workspace/") != null or get_shell.host_computer.File("/Workspace/" + workspace + "/") != null then
			for file in get_shell.host_computer.File("/Workspace/" + workspace + "/").get_files
				get_shell.scp(file.path, "/Workspace/workspaces/" + workspace + "/", server)
			end for
			print("<b>Pushing files finished</b>")
		end if
		OpenWorkspace(workspace)
	else if choice == workspaceFiles.len + 5 then
		MainMenu()
	else
		print("Not a valid choice.")
		OpenWorkspace(workspace)
	end if

end function

ManipulateFile = function(workspace, file)

	print("\n<size=19><u><b>" + file.name + "</u></b></size>")
	print("<b>[1]</b> Read file")
	print("<b>[2]</b> Delete file")
	print("<b>[3]</b> Download file")
	print("<b>[4]</b> Return to workspace menu")

	choice = user_input("Choice : ").to_int

	if choice >= 1 and choice <= 4 and typeof(choice) == "number" then
		if choice == 1 then
			print("\n<size=19><u><b>" + file.name + "</u></b></size>")
			print(file.content)
			
			ManipulateFile(workspace, file)
		else if choice == 2 then
			userSureToDelete = user_input("Are you sure you want to delete " + file.name + " ? ").lower
			if userSureToDelete == "y" or userSureToDelete == "yes" then
				server.host_computer.File(file.path).delete
			else
				OpenWorkspace(workspace)
			end if
			ManipulateFile(workspace, file)
		else if choice == 3 then
			DownloadFile(workspace, file, true)
		else if choice == 4 then
			OpenWorkspace(workspace)
		else
			exit("<color=red><u><b>There has been an error</b></u></color>")
		end if
	else
		print("Not a valid choice.")
		ManipulateFile(workspace, file)
	end if

end function

DownloadFile = function(workspace, file, doesReturnToFile)

	clientComputer = get_shell.host_computer

	if clientComputer.File("/Workspace/") == null then
		clientComputer.create_folder("/", "Workspace")
	end if

	if clientComputer.File("/Workspace/" + workspace + "/") == null then
			clientComputer.create_folder("/Workspace/", workspace)
	end if

	server.scp("/Workspace/workspaces/" + workspace + "/" + file.name, "/Workspace/" + workspace + "/", get_shell)

	if doesReturnToFile == true then
		print("\n<u><b>Download complete ! (/Workspace/" + workspace + "/)</b></u>")
		ManipulateFile(workspace, file)
	end if

end function

UploadFile = function(workspace, file)

	if path == null then
		clientFilePath = user_input("Files's path (name of the file included) : ")
	else
		clientFile = get_shell.host_computer.File(file.path)
	end if

	clientFile = get_shell.host_computer.File(clientFilePath)
	if clientFile != null then
		get_shell.scp(clientFilePath, "/Workspace/workspaces/" + workspace + "/", server)
		if path == null then
			ManipulateFile(workspace, clientFile)
		end if
	else
		print("<b>That file doesnt exists.</b>")
	end if

end function

// ----------------------
// Starting the software

userDataFile = server.host_computer.File("/Workspace/users/" + username.lower + "/data")
if GetSpecificUserInfo(username, "password") == Hash(password) then
	MainMenu()
else
	exit("<b><u>Wrong account informations.</u></b>")
end if
