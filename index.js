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
        if (Object.keys(ev.currentTarget.taula[currentValue]).indexOf("sou_base") == -1) {
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
        // 13 x (sou_base + (triennis * sou_trienni) + destinacio + responsabilitat + complement_experiencia) + 2 x (sou_base_ext + (triennis + sou_triennis_ext)) + destinacio + responsabilitat + complement_experiencia);

        var inputFigura = Array.apply(null, inputs.figura.getElementsByTagName("select")).pop();
        var figuraValue = inputFigura.taula[inputFigura.value];

        var horesInput = inputs.hores.input;
        var horesValue = horesInput.value;
        var paguesInput = inputs.pagues.input;
        var paguesValue = paguesInput.value;
        var antiguitatInput = inputs.antiguitat.input;
        var antiguitatValue = antiguitatInput.value;

        var sou_actual = figuraValue.sou_base;
        var nivell = figuraValue.nivell;
        var categoria = figuraValue.nivell.substring(0, 2);
        var vectorExperiencies = taules.experiencia[categoria];
        var plusExperiencia = vectorExperiencies[Math.min(antiguitatValue, vectorExperiencies.length - 1)];

        var sou_ajuntament = 13 * (taules.sou_base[categoria] + (Math.floor(antiguitatValue / 3) * taules.sou_trieni[categoria]) + taules.destinacio[nivell] + plusExperiencia) + 2 * (taules.sou_extra[categoria] + (Math.floor(antiguitatValue / 3) * taules.sou_trieni_extra[categoria]) + taules.destinacio[nivell] + taules.responsabilitat[nivell] + plusExperiencia);
        console.log(sou_ajuntament);
    }

    button.addEventListener("click", calcularSou);
}
