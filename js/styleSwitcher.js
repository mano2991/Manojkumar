
const links = document.querySelectorAll('.alternate-style'),
    totalLinks = links.length;

function setActiveStyle(color)
{
    for (let i = 0; i < totalLinks; i++) {
        if (color === links[i].getAttribute('title')) {
            links[i].removeAttribute('disabled');
        } else {
            links[i].setAttribute('disabled', true);
        }
    }
}

// body skin

const bodySkin = document.querySelectorAll('.body-skin'),
    totalBodySkin = bodySkin.length;

for (let i = 0; i < totalBodySkin; i++) {
    bodySkin[i].addEventListener('change', function(){
        if(this.value === 'dark'){
            document.body.className = 'dark';
        } else {
            document.body.className = '';
        }
    });
}

document.querySelector('.toggle-style-switcher').addEventListener('click', () => {
    document.querySelector('.style-switcher').classList.toggle('open');
});

document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.querySelector("#theme-toggle");
    const body = document.body;

    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark");
    }

    themeToggle.addEventListener("click", function() {
        body.classList.toggle("dark");

        if (body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });
});