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

    // let width = window.innerWidth;
    //   let height = window.innerHeight;

    //   let stage = new Konva.Stage({
    //     container: 'container',
    //     width: width,
    //     height: height
    //   });

    //   let layer = new Konva.Layer();

    //   let rect = new Konva.Rect({
    //     x: 50,
    //     y: 50,
    //     width: 100,
    //     height: 50,
    //     fill: 'green',
    //     stroke: 'black',
    //     strokeWidth: 4
    //   });

    //   // add the shape to the layer
    //   layer.add(rect);

    //   // add the layer to the stage
    //   stage.add(layer);

    function makeGroups(i, j, group, file, crop) {
        // let box = new Konva.Rect({
        //     x: i,
        //     y: j,
        //     width: 50,
        //     height: 50,
        //     name: 'red',
        //     fill: 'red',
        //     stroke: 'black',
        //     strokeWidth: 4
        // });
        

        let text = new Konva.Text({
            x: i,
            y: j + 50,
            text: file,
            fontSize: 14,
            width: 50,
            fontFamily: 'Calibri',
        });

        group.add(text);
        group.add(crop);

        
        
    }

    // prints out all files
    fs.readdir(newPath, function (err, files) {
        if (err) {
            return console.log("Unable to scan directory: " + err);
        }


        let width = window.innerWidth;
        let height = window.innerHeight;

        let stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: height
        });

        let layer = new Konva.Layer();

        function loadImage() {

            let imageObj = new Image();
            imageObj.onload = function(group) {
                let i = 15;
                let j = 0;
                let crop = new Konva.Image({
                    x: i,
                    y: j,
                    image: imageObj,
                    width: 50,
                    height: 50
                });

                // // print current directory
                // document.getElementById("currPath").innerHTML = process.cwd();
                
                
                files.forEach(function(file) {
                    // let p = document.createElement('p');
                    // p.textContent = file;
                    if (i > 250) {
                        i = 15;
                        j += 100;
                    }

                    let group = new Konva.Group({
                        id: 'cropGroup',
                        x: i,
                        y: j,
                    });
                    // makeGroups(i, j, group, file, crop);

                    
                    let text = new Konva.Text({
                        x: i,
                        y: j + 50,
                        text: file,
                        fontSize: 14,
                        width: 50,
                        fontFamily: 'Calibri',
                    });
                    
                    
                    group.add(text);
                    group.add(crop);
                    
                    
                    
                    // // if it is a directory (specify with **)
                    // if (fs.statSync(file).isDirectory()) {
        
                    // }
                    // else {

                    // }
                    layer.add(group);
                    i +=55;

                    
                })
                
                stage.add(layer);

            }
            
            imageObj.src = './images/cropMelon.png';

        }
        loadImage();
        
        
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
