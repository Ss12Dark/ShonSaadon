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

var quadimages = document.querySelectorAll("#quad figure");
for(i=0; i<quadimages.length; i++) {
  quadimages[i].addEventListener('click', function(){ this.classList.toggle("expanded"); quad.classList.toggle("full") }); 
}
