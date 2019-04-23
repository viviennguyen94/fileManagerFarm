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
goBackDirectory();
goIntoDirectory();
createFileFolder();

function loadImages(sources, callback) {
    var images = {};
    var loadedImages = 0;
    var numImages = 0;
    // get num of sources
    for (var src in sources) {
        numImages++;
    }
    for (var src in sources) {
        images[src] = new Image();
        images[src].onload = function() {
            if (++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].src = sources[src];
    }
}

function printContents() {

    function start(images) {
        // // print current directory
        // document.getElementById("currPath").innerHTML = process.cwd();
            
        // let width = window.innerWidth;
        // let height = window.innerHeight;
        let width = 2000;
        let height = 1000;

        let stage = new Konva.Stage({

            container: 'container',
            width: width,
            height: height,
        });

        let layer = new Konva.Layer();

        // set background
        let grassBackground = new Konva.Rect({
            x:0,
            y:0,
            width: width, 
            height: height,
            fillPatternImage: images.grass1,
        })

        layer.add(grassBackground);
    

        // set farm
        for (let i = 200; i < 1300; i = i + 50) {
            for (let j = 100; j < 800; j = j + 50) {
                let farm = new Konva.Rect({
                    x: i,
                    y: j,
                    width: 50,
                    height: 50,
                    fillPatternScaleX: 100,
                    fillPatternScaleY: 100,
                    fillPatternImage: images.dirt
                })
                layer.add(farm);
            }
        }

        // trash can
        console.log('trash');
        let trash = new Konva.Image({
            x: 1400,
            y: 150,
            name: 'trash',
            image: images.trash,
            width: 60,
            height: 65
        });

        trash.on('click', function(evt) {
            evt.cancelBubble = true;
            console.log('trash clicked');
            console.log('trash: ', evt.target.name())
        })
        layer.add(trash);
        stage.add(layer);

        stage.add(layer);

        // prints out all files
        fs.readdir(newPath, function (err, files) {
            if (err) {
                return console.log("Unable to scan directory: " + err);
            }

            let i = 115;
            let j = 55;

            // array of random crops! 
            // let cropVariety = ['cauliflower.png', 'cropBlueberry.png', 'cropCorn.png', 'cropMelon.png', 'cropPumpkin.png', 'cropStrawberry.png'];
            let cropVariety = [images.cauliflower, images.cropBlueberry, images.cropCorn, images.cropMelon, images.cropPumpkin, images.cropStrawberry]

            var group, text;
            files.forEach(function(file) {
                if (i > 650) {
                    i = 115;
                    j += 55;
                }

                // if it is a directory (specify with **)
                if (fs.statSync(file).isDirectory()) {
                    let isFile = true;
                    makeGroup(i, j, isFile, cropVariety, stage, layer, group, file);
                }
                else {
                    let isFile = false;
                    makeGroup(i, j, isFile, cropVariety, stage, layer, group, file);
                    
                }
                i +=45;
            })
        
            function makeGroup(i, j, isFile, cropVariety, stage, layer, group, file) {
                // start loading image                                    
                group = new Konva.Group({
                    x: i,
                    y: j,
                    name: 'blah',
                    draggable: true,
                });

                text = new Konva.Text({
                    x: i,
                    y: j + 65,
                    text: file,
                    // name: file,
                    fontSize: 16,
                    width: 80,
                    fontFamily: 'Calibri',
                    fontStyle: 'bold',
                    fill: 'white',
                });
                group.add(text);

                var crop;
                if (isFile) {
                    crop = new Konva.Image({
                        x: i,
                        y: j,
                        name: 'fileFarm ' + file,
                        image: images.hoe,
                        width: 60,
                        height: 65,
                        opacity: 1,
                    });
                } else {

                    crop = new Konva.Image({
                        x: i, 
                        y: j,
                        name: 'folderFarm ' + file,
                        image: cropVariety[Math.floor(Math.random() * 6)],
                        width: 60,
                        height: 65
                    })
                }
                
                group.add(crop);
                layer.add(group);
                
                deleteFileFolder(group, crop, layer);
                goIntoDirectory(group, stage);

                stage.add(layer);
            }
            
        });
    }

    var sources = {
        farm: './images/background/farm.png',
        dirt: './images/background/dirt.png',
        grass1: './images/background/grass1.png',
        grass2: './images/background/grass2.png',
        treeGrass:'./images/background/treegrassfield.png',
        cauliflower: './images/cauliflower.png',
        cropBlueberry: './images/cropBlueberry.png',
        cropCorn: './images/cropCorn.png',
        cropMelon: './images/cropMelon.png',
        cropPumpkin: './images/cropPumpkin.png',
        cropStrawberry: './images/cropStrawberry.png',
        hoe: './images/hoe.png',
        milkPail: './images/milkpail.png',
        wateringCan: './images/wateringcan.png',
        trash: './images/trash.png'
    }

    loadImages(sources, function(images) { // finishes sources then callback?
        console.log('hi!');
        start(images);
    })
}

function deleteFileFolder(group, crop, layer) {

    // group.on('click', function(evt) {
    //     console.log('asdfsdfa');
    // });

    crop.on('click', function(evt) {

        // push to array to delete
        if (evt.target.opacity() == 1) {
            this.opacity(0.5);
        // remove from array to deselect from deletion
        } else if (evt.target.opacity() == 0.5) {
            this.opacity(1);
        }
        console.log('image name: ', evt.target);

        layer.draw();
    })


    // // delete file/folder
    // document.addEventListener('dblclick', function (event) {

    //     // stores selected target to remove
    //     let fileDelete = "./";
    //     fileDelete += event.target.innerHTML;
    //     console.log(fileDelete);

    //     // if double clicked on delete file and delete child
    //     if (event.target.classList.contains('currFile')) {
    //         // remove clicked text from UI
    //         document.getElementById("currUL").removeChild(event.target);
    //         // it is a file
    //         // remove actual file
    //         fs.unlink(fileDelete, (err) => {
    //             if (err) {
    //                 console.error(err)
    //                 return
    //             }
    //             // file was removed
    //         })     
    //     }
    //     else if (event.target.classList.contains('currFolder')) {
    //         // remove clicked text from UI
    //         document.getElementById("currUL").removeChild(event.target);

    //         // if directory use remove to delete directory
    //         fs.remove(fileDelete, (err) => {
    //             if (err) {
    //                 console.log("could not delete directory: " + err) 
    //                 return
    //             }
    //         })  
    //     }
    // })
}

function goBackDirectory() {
    // go up a directory
    console.log('back');
    let button = document.querySelector("#goUP");
    button.addEventListener('click', function (event) {
        // go up a directory
        process.chdir("../")
        console.log(process.cwd());
        console.log('random');
        newPath = process.cwd();

        printContents();
        // printContents(path.join(__dirname))
    })
}

function goIntoDirectory(group, stage) {

    group.on('dblclick', function(evt) {
        var group = evt.target;
        console.log('You double clicked on ', group.name());

        let folderIn = "./";

        let substring = group.name().substr(group.name().indexOf(' ') + 1);
        folderIn += substring;
        console.log(folderIn);
        
        // change to new directory
        process.chdir(folderIn);
        newPath = process.cwd();


        stage.destroy();
        printContents();
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