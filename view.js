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

var app = new PIXI.Application(800, 600, {backgroundColor : 0xffffff});
printContents(app);
goBackDirectory(app);
deleteFileFolder(app);
goIntoDirectory(app);
createFileFolder(app);


function printContents(app) {


    goBackDirectory(app);
    
    document.getElementById('currContainer').appendChild(app.view);

    // print current directory
    document.getElementById("currPath").innerHTML = process.cwd();

    // prints out all files
    fs.readdir(newPath, function (err, files) {

        var container;
        
        if (err) {
            return console.log("Unable to scan directory: " + err);
        }

        let i = 25;
        let j = 0;

        // array of random crops! 
        let cropVariety = ['cauliflower.png', 'cropBlueberry.png', 'cropCorn.png', 'cropMelon.png', 'cropPumpkin.png', 'cropStrawberry.png'];

        files.forEach(function(file) {

            if (i > 250) {
                i = 25;
                j += 70;
            }

            // if it is a directory (specify with **)
            if (fs.statSync(file).isDirectory()) {
                // start loading image

                let isFolder = true;
                i = makeGroups(i, j, app, container, cropVariety, isFolder, file);
            }
            else {
                let isFolder = false;
                i = makeGroups(i, j, app, container, cropVariety, isFolder, file);
            }

            i +=45;
        })
        

        function makeGroups(i, j, app, container, cropVariety, isFolder, file) {

            container = new PIXI.Container();

            app.stage.addChild(container);

            var texture;

            if (isFolder) {
                texture = PIXI.Texture.fromImage('./images/hoe.png');
            } else {
                texture = PIXI.Texture.fromImage('./images/' + cropVariety[Math.floor(Math.random() * 6)]);
            }

            // adding image to container
            var fileImg = new PIXI.Sprite(texture);
            fileImg.x = i;
            fileImg.y = j;
            fileImg.width = 55;
            fileImg.height = 75;

            container.addChild(fileImg);

            // adding text to container
            var style = new PIXI.TextStyle({
                fontSize: 14,
                fontStyle: 'italic',
                wordWrap: true,
                breakWords: true,
                wordWrapWidth: 70,
            })
            var fileName = new PIXI.Text(file, style);
            fileName.x = i;
            fileName.y = j + 75;
            container.addChild(fileName);

            container.x = i;
            container.y = j;

            return i;
        }

    });
}

function deleteFileFolder(app) {
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

function goBackDirectory(app) {

    
    // go up a directory
    console.log('back');
    let button = document.querySelector("#goUP");
    button.addEventListener('click', function (event) {
        
        let b = app.stage.children.length - 1;
        while(b >= 0) {
            app.stage.removeChild(app.stage.children[b]);
            b--;
        }

        // go up a directory
        process.chdir("../")
        console.log(process.cwd());
        newPath = process.cwd();

        printContents(app);
        // printContents(path.join(__dirname))
    })
}

function goIntoDirectory(app) {
    // // go into a directory
    // document.addEventListener('click', function (event) {
    //     // if double clicked on delete file and delete child
    //     if (event.target) {
    //         // stores selected target to remove
    //         let folderIn = "./";
    //         folderIn += event.target.id();
    //         console.log(folderIn);
            
    //         // change to new directory
    //         process.chdir(folderIn);
    //         newPath = process.cwd();

    //         printContents();
            
    //     }
    //     // if file do nothing
    // })
}
function createFileFolder(app) {
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