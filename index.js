document.addEventListener("DOMContentLoaded", function () {
    fetch("data/taules.json").then(function (res) {
        res.text().then(function (text) {
            var taules = JSON.parse(text);
            startApp(taules);
        }).catch(function (err) {
            console.error(err);
            console.log("Error while parsing JSON");
        });
    }).catch(function (err) {
        console.error(err);
        console.log("Error on HTTP Comunication");
    });
});

function startApp (taules) {
    var fields = document.getElementsByClassName("field");
    var inputs = new Object();
    for (let field of fields) {
        inputs[field.id] = field;
        inputs[field.id].input = inputs[field.id].children[0];
        if (field.id == "figura") {
            inputs[field.id].input.taula = taules.figures;
        }
    }
    var button = document.getElementById("calcul").children[0];

    var option;
    [""].concat(Object.keys(taules.figures)).forEach(function (value, index, self) {
        option = document.createElement("option");
        option.value = value;
        option.text = value;
        inputs.figura.input.appendChild(option);
    });

    function onFiguraChange (ev) {
        var parent = ev.currentTarget;
        var currentValue = ev.currentTarget.value;
        if (ev.currentTarget.taula[currentValue]) {
            var selectNode;
            if (parent.children_select) {
                selectNode = parent.children_select;
                selectNode.innerHTML = "";
                if (selectNode.children_select) {
                    selectNode.children_select.parentNode.removeChild(selectNode.children_select);
                    selectNode.children_select = undefined;
                }
            } else {
                selectNode = document.createElement("select");
                selectNode.parent = parent;
                parent.children_select = selectNode;
                inputs.figura.appendChild(selectNode);
            }

            selectNode.taula = ev.currentTarget.taula[currentValue];

            var values;
            if (Array.isArray(selectNode.taula)) {
                values = [""].concat(selectNode.taula);
            } else {
                values = [""].concat(Object.keys(selectNode.taula));
            }
            for (let value of values) {
                var optionNode = document.createElement("option");
                optionNode.value = value;
                optionNode.text = value;
                selectNode.appendChild(optionNode);
            }
            selectNode.addEventListener("change", onFiguraChange);
        } else {
            habilitarCalcul();
        }
    }
    inputs.figura.input.addEventListener("change", onFiguraChange);
    inputs.hores.input.addEventListener("change", habilitarCalcul);
    inputs.antiguitat.input.addEventListener("change", habilitarCalcul);
    inputs.pagues.input.addEventListener("change", habilitarCalcul);

    function habilitarCalcul () {
        if (Object.keys(inputs).reduce(function (acum, key) {
            return acum && inputs[key].input.value != undefined && inputs[key].input.value != "";
        }, true)) {
            button.removeAttribute("disabled");
        } else {
            button.setAttribute("disabled", "true");
        }
    }

    function calcularSou () {
        console.log("calcular sou");
    }

    button.addEventListener("click", calcularSou);
}