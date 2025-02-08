document.getElementById("skills").style.display = 'grid';

let tabs = document.getElementsByClassName("tab");
let tabscontent = document.getElementsByClassName("tab_content");


function openTab(e, tabname) {
    for(tab of tabs){
        tab.classList.remove("active_tab");
    }

    for(content of tabscontent){
        content.classList.remove("active_tab");
    }

    e.currentTarget.classList.add("active_tab");
    document.getElementById(tabname).classList.add("active_tab");
    switch(tabname) {
        case "skills":{
            document.getElementById(tabname).style.display = 'grid';
            document.getElementById("experience").style.display = 'none';
            break;
        }
        case "experience":{
            document.getElementById(tabname).style.display = 'grid';
            document.getElementById("skills").style.display = 'none';
            break;
        }
    }
}

let midVideo = document.getElementById('mid-video');
let midImage = document.getElementById('mid-image');

let centerImage = document.getElementById('center-image');
let centerText = document.getElementById('center-text');

var images = document.querySelectorAll(".images img");

for(i=0; i<images.length; i++) {
    images[i].addEventListener('click', function(){
        centerImage.src = this.getAttribute('src');
        centerText.innerHTML = this.getAttribute('hiddentext');

        if (!midVideo.classList.contains('mid-hidden')) {
            midVideo.classList.toggle('mid-hidden');
            midVideo.src = "";
        }
        if (midImage.classList.contains('mid-hidden')) {
            midImage.classList.toggle('mid-hidden');
        }
    }); 
}

var videos = document.querySelectorAll(".videos img");

for(i=0; i<videos.length; i++) {
    videos[i].addEventListener('click', function(){
        midVideo.src = this.getAttribute('hiddenlink');

        if (midVideo.classList.contains('mid-hidden')) {
            midVideo.classList.toggle('mid-hidden');
        }
        if (!midImage.classList.contains('mid-hidden')) {
            midImage.classList.toggle('mid-hidden');
        }
    }); 
}
