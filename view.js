const fs = require('fs-extra');
const path = require('path');
let newPath = __dirname;
// const konva = require('konva');

// ipc render part
const electron = require('electron');
const {ipcRenderer} = electron;

// const rootDir = fs.readdirSync("C:\\")

// function printRoot() {
//     // let str = '';
//     rootDir.forEach(function(file) {
//         // str+= '<p>' + file + '</p>';
//         let p = document.createElement("p");
//         p.textContent = file;
//         document.getElementById("rootUL").appendChild(p);
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
        
        let width = window.innerWidth;
        let height = window.innerHeight;

        let stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: height
        });

        let layer = new Konva.Layer();

        let i = 25;
        let j = 0;

        // array of random crops! 
        let cropVariety = ['cauliflower.png', 'cropBlueberry.png', 'cropCorn.png', 'cropMelon.png', 'cropPumpkin.png', 'cropStrawberry.png'];

        files.forEach(function(file) {

            // if it is a directory (specify with **)
            if (fs.statSync(file).isDirectory()) {
                // start loading image
                let imageObj = new Image();
                imageObj.onload = function() {
                    if (i > 250) {
                        i = 25;
                        j += 55;
                    }
                
                    let group = new Konva.Group({
                        id: file,
                        name: 'folder',
                        x: i,
                        y: j,
                    });
                    // makeGroups(i, j, group, file, crop);
                    let text = new Konva.Text({
                        x: i,
                        y: j + 65,
                        text: file,
                        fontSize: 14,
                        width: 80,
                        fontFamily: 'Calibri',
                    });
                    group.add(text);
                    // addFolders(folders, file);
                    let crop = new Konva.Image({
                        x: i,
                        y: j,
                        image: imageObj,
                        width: 60,
                        height: 65
                    });
                    group.add(crop);
                    layer.add(group);
                    // layer.add(crop);
                    i +=45;

                    stage.add(layer);

                        console.log('i: ', i);
                        console.log('j: ', j);

                }
                imageObj.src = './images/' + cropVariety[Math.floor(Math.random() * 6)];
            }
            else {
                // start loading image
                let imageObj = new Image();
                imageObj.onload = function() {
                    if (i > 250) {
                        i = 25;
                        j += 55;
                    }
                
                    let group = new Konva.Group({
                        id: file,
                        name: 'folder',
                        x: i,
                        y: j,
                    });
                    // makeGroups(i, j, group, file, crop);
                    let text = new Konva.Text({
                        x: i,
                        y: j + 65,
                        text: file,
                        fontSize: 14,
                        width: 80,
                        fontFamily: 'Calibri',
                    });
                    group.add(text);
                    // addFolders(folders, file);
                    let crop = new Konva.Image({
                        x: i,
                        y: j,
                        image: imageObj,
                        width: 60,
                        height: 65
                    });
                    group.add(crop);
                    layer.add(group);
                    // layer.add(crop);
                    i +=45;

                    stage.add(layer);

                }
                imageObj.src = './images/hoe.png';
                // addFiles(files1, file);
            }
        })

    });
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
    console.log('back');
    let button = document.querySelector("#goUP");
    button.addEventListener('click', function (event) {
        // go up a directory
        process.chdir("../")
        console.log(process.cwd());
        newPath = process.cwd();

        printContents();
        // printContents(path.join(__dirname))
    })
}

function goIntoDirectory() {
    // go into a directory
    document.addEventListener('click', function (event) {
        // if double clicked on delete file and delete child
        if (event.target) {
            // stores selected target to remove
            let folderIn = "./";
            folderIn += event.target.id();
            console.log(folderIn);
            
            // change to new directory
            process.chdir(folderIn);
            newPath = process.cwd();

            printContents();
            
        }
        // if file do nothing
    })
}
function createFileFolder() {
    ipcRenderer.on('file:add', function(e, file) {
        const p = document.createElement('p');
        const itemText = document.createTextNode(file);
        p.appendChild(itemText);

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
                    document.getElementById('currUL').appendChild(p);
                    p.style.color = "red";
                    resolve();
                })
            })
        }
        mkdirIfNotExists(file);
    })
}