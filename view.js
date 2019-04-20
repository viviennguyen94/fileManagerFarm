const fs = require('fs-extra');
const path = require('path');
let newPath = __dirname;

// ipc render part
const electron = require('electron');
const {ipcRenderer} = electron;

// const rootDir = fs.readdirSync("C:\\")

// function printRoot() {
//     // var str = '';
//     rootDir.forEach(function(file) {
//         // str+= '<li>' + file + '</li>';
//         var li = document.createElement("li");
//         li.textContent = file;
//         document.getElementById("rootUL").appendChild(li);
//     })
//     // document.getElementById("files").innerHTML = str;
// }
// printRoot();
printContents();
deleteFileFolder();
goBackDirectory();
goIntoDirectory();
createFileFolder();

function printContents() {

    // prints out all files
    fs.readdir(newPath, function (err, files) {
        if (err) {
            return console.log("Unable to scan directory: " + err);
        }

        // print current directory
        document.getElementById("currPath").innerHTML = process.cwd();
        
        files.forEach(function(file) {
            var li = document.createElement('li');
            li.textContent = file;

            // if it is a directory (specify with **)
            if (fs.statSync(file).isDirectory()) {
                // li.textContent += "**";
                li.classList.add('currFolder')
                document.getElementById("currUL").appendChild(li);
                li.style.color = "red";
                // console.log("folder", file);
            }
            else {
                // if file
                li.classList.add('currFile')
                document.getElementById("currUL").appendChild(li);
                // console.log("file: ", file);
            }
        })
    });
}

function deleteContents () {
    let root = document.getElementById("currUL");
    // delete all files from dom list
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
}

function deleteFileFolder() {
    // delete file/folder
    document.addEventListener('dblclick', function (event) {

        // stores selected target to remove
        let fileDelete = "./";
        fileDelete += event.target.innerHTML;
        console.log(fileDelete);

        // if double clicked on delete file and delete child
        if (event.target.classList.contains('currFile')) {
            // remove clicked text from UI
            document.getElementById("currUL").removeChild(event.target);
            // it is a file
            // remove actual file
            fs.unlink(fileDelete, (err) => {
                if (err) {
                    console.error(err)
                    return
                }
                // file was removed
            })     
        }
        else if (event.target.classList.contains('currFolder')) {
            // remove clicked text from UI
            document.getElementById("currUL").removeChild(event.target);

            // if directory use remove to delete directory
            fs.remove(fileDelete, (err) => {
                if (err) {
                    console.log("could not delete directory: " + err) 
                    return
                }
            })  
        }
    })
}

function goBackDirectory() {
    // go up a directory
    let button = document.querySelector("#goUP");
    button.addEventListener('click', function (event) {
        // go up a directory
        process.chdir("../")
        console.log(process.cwd());
        newPath = process.cwd();

        deleteContents();
        printContents();
        // printContents(path.join(__dirname))
    })
}

function goIntoDirectory() {
    // go into a directory
    document.addEventListener('click', function (event) {
        // if double clicked on delete file and delete child
        if (event.target.classList.contains('currFolder')) {
            // stores selected target to remove
            let folderIn = "./";
            folderIn += event.target.innerHTML;
            console.log(folderIn);
            
            // change to new directory
            process.chdir(folderIn);
            newPath = process.cwd();

            deleteContents();
            printContents();
            
        }
        // if file do nothing
    })
}
function createFileFolder() {
    ipcRenderer.on('file:add', function(e, file) {
        const li = document.createElement('li');
        const itemText = document.createTextNode(file);
        li.appendChild(itemText);

        // // create actual file if it does not exist
        // fs.appendFile()

        // create actual folder if it does not exist
        function checkIfDirectoryExists(file, successCallback, errorCallback) {
            try {
                if(fs.lstatSync.isDirectory()) {
                    successCallback();
                    alert("folder/file already exists!")
                }
            } catch (e) {
                errorCallback();
            }
        };

        function mkdirIfNotExists (file) {
            return new Promise(function(resolve, reject) {
                checkIfDirectoryExists(file, function() {
                    resolve();
                    console.log("OMG!")
                    alert("folder/file already exists!")
                }, function() {
                    fs.mkdirSync(file);
                    // if folder successfully created output
                    document.getElementById('currUL').appendChild(li);
                    li.style.color = "red";
                    resolve();
                })
            })
        }
        mkdirIfNotExists(file);
    })
}