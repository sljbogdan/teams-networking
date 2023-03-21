const API = { 
    CREATE: {
        URL: "http://localhost:3000/teams/create",
        METHOD: "POST"
    },
    READ : {
        URL: "http://localhost:3000/teams",
        METHOD: "GET"
    },
    UPDATE: {
        URL: "http://localhost:3000/teams/update",
        METHOD: "PUT"
    },
    DELETE: {
        URL: "http://localhost:3000/teams/delete",
        METHOD: "DELETE"
    }
};

let allTeams = [];
let editId;

const isDemo = true || location.host === "sljbogdan.github.io";
const inlineChanges = isDemo;

// for demo purposes ... 
if(isDemo) {
    API.READ.URL = "data/teams.json";
    API.DELETE.URL = "data/delete.json";
    API.CREATE.URL = "data/create.json";
    API.UPDATE.URL = "data/update.json";

    API.DELETE.METHOD = "GET";
    API.CREATE.METHOD = "GET";
    API.UPDATE.METHOD = "GET";
}


function loadTeams(){
    fetch(API.READ.URL)
        .then(r => r.json())
        .then(teams => {
            allTeams = teams;
            displayTeams(teams);
        })
}

function highlight(text, search){
    return search ? text.replaceAll(search, m =>{
        return `<span class ="highlight">${m}</span>`;
    }) : text;
}

function getTeamsAsHTML(teams, search){
    
    return teams.map(team => {
        const url = team.url;
        const displayUrl = url ? (url.includes("//github.com/") ? url.replace("https://github.com/", "") : "view") : "";
            return `<tr>
                    <td>${highlight(team.promotion, search)}</td>
                    <td>${highlight(team.members, search)}</td>
                    <td>${highlight(team.name, search)}</td>
                    <td>
                    <a target="_blank" href="${url}">${highlight(displayUrl, search)}</a>
                    </td>
                    <td>
                        <a href="#" class="delete-btn" data-id="${team.id}">&#10006;</a>
                        <a href="#" class="edit-btn" data-id="${team.id}">&#9998;</a>
                    </td>
                    </tr>`
    }).join('');
}

function displayTeams(teams) {
    const search = document.getElementById("search").value;
    const html = getTeamsAsHTML(teams, search ? new RegExp(search, "gi") : "");
    document.querySelector('#table tbody').innerHTML = html;
}

function getTeamValues(){
    const promotion = document.querySelector('[name=promotion]').value;
    const members = document.querySelector('[name=members]').value;
    const name = document.querySelector('[name=name]').value;
    const url = document.querySelector('[name=url]').value;
    return  {
        promotion: promotion,
        members: members,
        name,
        url
    };
}

function setTeamValues(team){
    document.querySelector('[name=promotion]').value = team.promotion;
    document.querySelector('[name=members]').value = team.members;
    document.querySelector('[name=name]').value = team.name;
    document.querySelector('[name=url]').value = team.url;
}

function saveTeam(team){
    const method = API.CREATE.METHOD;
    fetch(API.CREATE.URL, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: method === "GET" ? null : JSON.stringify(team)
    })
        .then(r => r.json())
        .then(r => {
            if(r.success){
                if(inlineChanges){
                    allTeams = [...allTeams, { ...team, id: r.id }];
                    displayTeams(allTeams);
                } else {
                    loadTeams();
                }
                document.querySelector('form').reset();
            }
        });
}

function deleteTeam(id){
    const method = API.DELETE.METHOD;
    fetch(API.DELETE.URL, {
    method,
    headers: {
        "Content-Type": "application/json"
    },
    body: method === "GET" ? null : JSON.stringify({ id })
    })
        .then(r => r.json())
        .then(status => {
            if(status.success){
                if(inlineChanges){
                    allTeams = allTeams.filter(team => team.id !== id);
                    displayTeams(allTeams);
                } else {
                    loadTeams();
                }
            }
        });
}

function updateTeam(team){
    const method = API.UPDATE.METHOD;
    fetch(API.UPDATE.URL, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: method === "GET" ? null : JSON.stringify(team)
    })
    .then(r => r.json())
    .then(status => {
        if(status.success){
            if(inlineChanges){
                allTeams = allTeams.map(t => (t.id === editId ? team : t));
                displayTeams(allTeams);
            } else {
                loadTeams();
            }
            document.querySelector('form').reset();
            editId = 0; 
        }
    });
}

function editTeam(id){
    editId = id;
    const team = allTeams.find(team => team.id === id);
    setTeamValues(team);
}

function submitTeam() {
    const team = getTeamValues();
    if(editId){
        team.id = editId;
        updateTeam(team);
    } else {
        saveTeam(team); 
    }
}

loadTeams();

document.querySelector('#table tbody').addEventListener("click", e => {
    if(e.target.matches("a.delete-btn")){
        const id = e.target.getAttribute("data-id");
        console.warn("delete id",id);
        deleteTeam(id);
    } else if(e.target.matches("a.edit-btn")){
      const id = e.target.getAttribute("data-id");
      editTeam(id);
    }
})


document.getElementById("search").addEventListener("input", e => {
    const text = e.target.value.toLowerCase().toUpperCase();
    const filtered = allTeams.filter(team =>{
        return team.members.toLowerCase().toUpperCase().includes(text) || 
        team.name.toLowerCase().toUpperCase().includes(text) || 
        team.promotion.toLowerCase().toUpperCase().includes(text) || 
        team.url.toLowerCase().toUpperCase().includes(text);
    });
    displayTeams(filtered);
});
