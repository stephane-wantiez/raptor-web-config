

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/00-mbRetrocompatibility.js ****/
var Dom = YAHOO.util.Dom;
var Event = YAHOO.util.Event;
var Connect = YAHOO.util.Connect;

var project = 0;

getMilliTime = function(){
	return Date.now() / 1000;
};

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/10-mbMenu.js ****/
var mbMenu_buttons = [];

var currentMenu = false;

// Classe non destinée à être instanciée directement, celle-ci est uniquement héritée par mbMenuButton et mbMenuList.
function mbMenu() {
	this.checked = false;

	this.selectedPage = null;
	this.selectedId = 0;

	this.button = null; // Bouton YUI.
	this.tabView = null; // Tabview du menu courant.
	this.pages = new Array(); // Tableau récapitulant les différentes pages existantes.

	this.content = 'data';

	// Retourne le TabView lié au menu.
	this.getTabView = function() {
		if (!this.tabView) {
//			this.tabView = new YAHOO.widget.TabView();
//			this.tabView.appendTo(this.content); // Ajoute la tabView
			this.tabView = new mbTabView(Dom.get(this.content));

			// Ajoute la zone d'affichage des loaders.
			var zone = document.createElement('div');
			zone.setAttribute('id', 'loadZone');
			zone.className = 'loadZone';

			var loadStatus = document.createElement('div');
			loadStatus.setAttribute('id', 'loadStatus');
			loadStatus.className = 'loadStatus';
			zone.appendChild(loadStatus);

			Dom.get('data').appendChild(zone);
			
			this.formContainer = document.createElement("div");
			this.formContainer.setAttribute("id", "form-container");
			Dom.get(this.content).appendChild(this.formContainer);
		}

		return this.tabView;
	};

	// Récupère l'id sélectionnée.
	this.getSelectedId = function() {
		return this.selectedId;
	};

	// Récupère la page
	this.getSelectedPage = function() {
		return this.selectedPage;
	};

	// Ajoute le menu courant à la liste des menus si les niveaux d'accès sont autorisés
	this.addToMenuList = function() {
		if(MetaBot.userAccessManager.hasAccess(this.minAccessLevel, this.maxAccessLevel, this.id)){
			mbMenu_buttons[this.link] = this;
		}
	};

	// Checke le menu courant.
	this.check = function(value) {
		currentMenu = this;
		Dom.get(this.content).innerHTML = ''; // Efface le contenu de la zone de données.

		mbLink_menu = this.link;

		// Si le menu courant est un split.
		if (this.type == 'menu') {
			if (!isNaN(value) && value >= 0) {
				this.value = value;
				this.text = this.list[this.value];
			}

			mbLink_case = this.getValue();
		} else {
			mbLink_case = -1;
		}
		mbLink_update();

		// Checke d'emblée l'élément courant
		this.button.addClass("active");

		this.checked = true;

		// Liste ensuite la totalité des boutons pour décocher ce qui doit l'être.
		for (var i in mbMenu_buttons) {
			// Si le bouton courant est checké.
			if (mbMenu_buttons[i].checked) {
				if (mbMenu_buttons[i] == this) {
					mbMenu_buttons[i].tabView = null; // Supprime la TabView du menu.
					mbMenu_buttons[i].pages = [];
					mbMenu_buttons[i].pageLink = 'nopage';

					Dom.setStyle("previewVRML", 'visibility', 'hidden');
				} else {
					mbMenu_buttons[i].checked = false;

					mbMenu_buttons[i].button.removeClass('active');
				}
			}
		}
	};

	// Ajoute une page.
	this.addPage = function(page) {
		this.pages[page.link] = page;
	};

	// Sélectionne une page donnée.
	this.selectPage = function(page) {
		// Si on a bien un tabview.
		if (this.tabView) {
			if (page && this.selectedPage != page) {
				this.selectedPage = page;

				mbLink_page = page.link;
				mbLink_update();

				this.tabView.selectTab(page.tabIndex);
			}
		} else {
			alert('Aucune page n\'a été ajoutée au menu.');
		}
	};

	// Chargement du contenu lié au menu.
	this.load = function(index, page, id, tab) {
		this.selectedId = id;
		if (currentMenu != this) {
			this.check(index);
			this.onclick(this.param);
		}

		// Recherche parmi les pages existantes les possibilités de chargement.
		if (page && (!this.selectedPage || this.selectedPage.link != page)) {
			for (var i in this.pages) {
				if (i == page) {
					this.selectPage(this.pages[page]);
					break;
				}
			}
		}
		if (this.selectedId) {
			this.selectedPage.selectRecord(this.selectedId);
			this.selectedPage.displayDataTab(tab);
		}
	};
}

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/formatters.js ****/
var progressFormatter = function(elCell, oRecord, oColumn, oData) {
	var f;
	var size = 60;
	if(typeof oData == 'string'){
		var data = oData.split('/');
		var a = parseInt(data[0]);
		var b = parseInt(data[1]);
		f = a / b;
		if(f < 0){
			f = 0;
		}else if(f > 1){
			f = 1;
		}
		label = (Math.round(f * 10000) / 100) + '% [' + a + '/' + b + ']';
	}else{
		f = parseFloat(oData);
		label = (Math.round(f * 10000) / 100) + '%';
	}
	elCell.innerHTML = '<div style="display:inline-block;width: ' + size + 'px; height: 5px; border: 1px solid black;"><div style="width:' + Math.round(f * size) + 'px; height: 5px; background-color: orange;"></div></div> <span style="margin-right: 2px;font-size:8pt">' + label + '</span>';
};
YAHOO.widget.DataTable.Formatter.progress = progressFormatter;

var evolutionFormatter = function(elCell, oRecord, oColumn, oData) {
	elCell.style.textAlign = "right";
	
	var f;
	var margin = 0.05;
	if(typeof oData == 'string'){
		var data = oData.split('/');
		if(data.length == 1){
			elCell.innerHTML = data;
			return;
		}else{
			var a = parseInt(data[0]);
			var b = parseInt(data[1]);
			f = a / b - 1;
			label = (Math.round(f * 10000) / 100) + '% [' + a + '/' + b + ']';
		}
	}else{
		f = parseFloat(oData);
		label = (Math.round(f * 10000) / 100) + '%';
	}
	if(f > 0){
		label = '+' + label;
	}
	
	if(f < -margin){
		label += '<i class="icon icon-arrow-down"></i>';
	}else if(f > margin){
		label += '<i class="icon icon-arrow-up"></i>';
	}else{
		label += '<i class="icon icon-minus"></i>';
	}
	elCell.innerHTML = label;
};
YAHOO.widget.DataTable.Formatter.evolution = evolutionFormatter;


var percentFormatter = function(elCell, oRecord, oColumn, oData) {
	elCell.innerHTML = (Math.round(oData * 10000) / 100) + '%';
};
YAHOO.widget.DataTable.Formatter.percent = percentFormatter;


var dateFormatter = function(elCell, oRecord, oColumn, oData) {
	if(oData){
		var date = new Date(oData * 1000);
		var d = date.getUTCDate();
		if(d < 10){
			d = "0" + d;
		}
		var m = (date.getUTCMonth() + 1);
		if(m < 10){
			m = "0" + m;
		}
		var y = date.getUTCFullYear();
		var h = date.getUTCHours();
		if(h < 10){
			h = "0" + h;
		}
		var i = date.getUTCMinutes();
		if(i < 10){
			i = "0" + i;
		}
		elCell.innerHTML = '<span style="font-size:12px">' + d + '/' + m + '/' + y + '</span> <span style="font-size:9px">' + h + 'h' + i + '</span>';
	}else{
		elCell.style.textAlign = "center";
		elCell.innerHTML = '-';
	}
};
YAHOO.widget.DataTable.Formatter.date = dateFormatter;


var timeFormatter = function(elCell, oRecord, oColumn, oData) {
	if(oData){
		var days = Math.floor(oData / (3600 * 24));

		var hours = Math.floor((oData % (3600 * 24)) / 3600);

		var minutes = Math.floor((oData % (3600)) / 60);

		var seconds = oData % 60;

		var result = "";
		if(days > 0){
			result += days + " " + _2("days-abbr") + " ";
		}
		if(hours > 0){
			result += hours + " " + _2("hours-abbr") + " ";
		}
		if(minutes > 0){
			result += minutes + " " + _2("minutes-abbr") + " ";
		}
		result += seconds + " " + _2("seconds-abbr");
		elCell.innerHTML = result;
	}else{
		elCell.style.textAlign = "center";
		elCell.innerHTML = '-';
	}
};
YAHOO.widget.DataTable.Formatter.time = timeFormatter;

var colorFormatter = function(elCell, oRecord, oColumn, oData) {
	var textColor = false;
	if(oColumn.data){
		textColor = oRecord.getData(oColumn.data);
		if(!textColor){
			textColor = 'black';
		}
	}
	if(oData || textColor){
		elCell.style.textAlign = 'center';
		elCell.innerHTML = '<div style="font-size:8pt;text-align:center;margin:auto;width:32px;height:16px;border: black solid 1px;background-color:' + oData + ';color:' + textColor + '">' + (textColor?'Texte':'') + '</div>';
	}
};
YAHOO.widget.DataTable.Formatter.color = colorFormatter;

var trueFalseFormatter = function(c, o, column, data){
	c.style.textAlign = "center";
    if(data != '0' && data != ''){
        c.innerHTML = '<span class="badge badge-success"><i class="icon-ok icon-white"/></span>';
    }else{
        c.innerHTML  = '<span class="badge badge-important"><i class="icon-remove icon-white"/></span>';
    }
};
YAHOO.widget.DataTable.Formatter.trueFalse = trueFalseFormatter;

var soundPreviewFormatter = function(c, o, column, data){
    if(data && data != '0' && data != ''){
    	c.innerHTML = '<audio controls><source src="' + data + '" type="audio/mpeg">Your browser does not support the audio element.</audio>';
    }else{
        c.innerHTML  = '<span class="badge badge-important"><i class="icon-remove icon-white"/></span>';
    }
};
YAHOO.widget.DataTable.Formatter.soundPreview = soundPreviewFormatter;

var editableTrueFalseFormatter = function(c, o, column, data){
	c.style.textAlign = "center";
	c.style.cursor = 'pointer';
	var isTrue = (data != '0' && data != '');
    if(isTrue){
        c.innerHTML = '<span class="badge badge-success"><i class="icon-ok icon-white"/></span>';
    }else{
        c.innerHTML  = '<span class="badge badge-important"><i class="icon-remove icon-white"/></span>';
    }
	Event.addListener(c, 'mouseover', function(e){ c.style.backgroundColor = '#A2C2EF';});
	Event.addListener(c, 'mouseout', function(e){ c.style.backgroundColor = 'transparent';});
    Event.addListener(c, "click", function(e){
    	Connect.asyncRequest('POST', column.data.url, {
			success: function(o){
				if(o.responseText){
					alert(o.responseText);
				}
				column.getMBTable().refresh();
				if(column.data.onUpdate){
					column.data.onUpdate();
				}
			},
			failure: function(o){
				alert(o.statusText);
			}
		}, 'value=' + (isTrue?0:1) + '&id=' + o.getData('id') + '&' + column.getMBTable().where);
    });
};
YAHOO.widget.DataTable.Formatter.editableTrueFalse = editableTrueFalseFormatter;

var summarizeFormatter = function(c, o, column, data){
	c.style.fontSize = '8pt';
	var max = column.data?column.data:100;
	var cleanText = $("<div>" + data + "</div>").get(0).innerText;
	if(cleanText && data && cleanText.length > max){
		c.innerHTML = '<span title="' + cleanText + '">' + data.substr(0, max - 3) + '...</span>';
	}else{
		c.innerHTML = data;
	}
};
YAHOO.widget.DataTable.Formatter.summarize = summarizeFormatter;

var summarizeFalseOnZeroFormatter = function(c, o, column, data){
	if(data && data != '0'){
		YAHOO.widget.DataTable.Formatter.summarize(c, o, column, data);
	}else{
		c.style.textAlign = "center";
	    c.innerHTML = '<span class="badge badge-important"><i class="icon-remove icon-white"/></span>';
	}
};
YAHOO.widget.DataTable.Formatter.summarizeFalseOnZero = summarizeFalseOnZeroFormatter;

var summarizeTrueOnZeroFormatter = function(c, o, column, data){
	if(data && data != '0'){
		YAHOO.widget.DataTable.Formatter.summarize(c, o, column, data);
	}else{
		c.style.textAlign = "center";
	    c.innerHTML = '<span class="badge badge-success"><i class="icon-ok icon-white"/></span>';
	}
};
YAHOO.widget.DataTable.Formatter.summarizeTrueOnZero = summarizeTrueOnZeroFormatter;

var editableSummarizeFormatter = function(c, o, column, data){
	c.style.fontSize = '8pt';
	var max = 60;
	if(data.length > max){
		c.innerHTML = '<span title="' + data + '">' + data.substr(0, max - 3) + '...</span>';
	}else{
		c.innerHTML = data;
	}
	Event.addListener(c, 'mouseover', function(e){ c.style.backgroundColor = '#A2C2EF';});
	Event.addListener(c, 'mouseout', function(e){ c.style.backgroundColor = 'transparent';});
    Event.addListener(c, "click", function(e){
    	Connect.asyncRequest('POST', column.data, {
			success: function(o){
				if(o.responseText){
					alert(o.responseText);
				}
				column.getMBTable().refresh();
			},
			failure: function(o){
				alert(o.statusText);
			}
		}, 'value=' + prompt('Nouvelle valeur', data) + '&id=' + o.getData('id') + '&' + column.getMBTable().where);
    });
};
YAHOO.widget.DataTable.Formatter.editableSummarize = editableSummarizeFormatter;

var orderFormatter = function(c, row, column, data){
	formatOrder(c, row, column, data,
		function(e){
			if(!column.data){
				alert('Missing url data');
			}else{
				c.innerHTML = '<img style="padding:7px 2px" src="' + WEB_STATIC_URI + 'vendor/metabot/img/loading.gif"/>';
				Connect.asyncRequest('post', column.data, {
					success: function(o){
						if(o.responseText){
							alert(o.responseText);
						}
						column.getMBTable().refresh();
					},
					failure: function(o){
						alert(o.statusText);
					}
				}, 'up=1&rowId=' + row.getData('id') + '&' + column.getMBTable().where);
			}
		},
		function(e){
			if(!column.data){
				alert('Missing url data');
			}else{
				c.innerHTML = '<img style="padding:7px 2px" src="' + WEB_STATIC_URI + 'vendor/metabot/img/loading.gif"/>';
				Connect.asyncRequest('post', column.data, {
					success: function(o){
						if(o.responseText){
							alert(o.responseText);
						}
						column.getMBTable().refresh();
					},
					failure: function(o){
						alert(o.statusText);
					}
				}, 'down=1&rowId=' + row.getData('id') + '&' + column.getMBTable().where);
			}
		}
	);
};
function formatOrder(c, row, column, data, onUp, onDown){
	c.title = "Ordre : " + data;
	var up = document.createElement('div');
	up.title = "Monter";
	up.style.background = 'url(' + WEB_STATIC_URI + 'vendor/metabot/img/icons/bullet_arrow_up.png) center center no-repeat';
	up.style.display = 'block';
	up.style.width = '20px';
	up.style.height = '15px';
	up.style.margin = 0;
	Event.addListener(up, 'mouseover', function(e){ up.style.backgroundColor = '#B2D2FF';});
	Event.addListener(up, 'mouseout', function(e){ up.style.backgroundColor = 'transparent';});
	Event.addListener(up, 'click', onUp);

	var down = document.createElement('div');
	down.title = "Descendre";
	down.style.background = 'url(' + WEB_STATIC_URI + 'vendor/metabot/img/icons/bullet_arrow_down.png) center center no-repeat';
	down.style.display = 'block';
	down.style.width = '20px';
	down.style.height = '15px';
	down.style.margin = 0;
	Event.on(down, 'mouseover', function(e){ down.style.backgroundColor = '#B2D2FF';});
	Event.on(down, 'mouseout', function(e){ down.style.backgroundColor = 'transparent';});
	Event.on(down, 'click', onDown);

	c.appendChild(up);
	c.appendChild(down);
}
YAHOO.widget.DataTable.Formatter.order = orderFormatter;

var buttonFormatter = function(c, row, column, data){
	var elm = $("<button>").attr("type", "button").addClass("btn btn-mini").append('<i class="icon-' + column.data.icon + '"/>');
	elm.attr("title", column.data.label);
	elm.tooltip();
	elm.click(function(e){
		column.data.callback(row, data);
	});
	c.appendChild(elm.get(0));
};
YAHOO.widget.DataTable.Formatter.button = buttonFormatter;

var removeFormatter = function(c, row, column, data){
	var del = $("<button>").addClass("btn btn-danger btn-mini").append('<i class="icon-remove icon-white"/>').attr("type", "button");
	del.attr("title", "Retirer de la liste");
	del.tooltip();
	del.click(function(e){
		if(!column.data){
			alert('Missing url data');
		}else{
			if(confirm("Etes-vous sûr de vouloir retirer cet élément de la liste ?")){
				c.innerHTML = '<img style="padding:7px 2px" src="' + WEB_STATIC_URI + 'vendor/metabot/img/loading.gif"/>';
				Connect.asyncRequest('post', column.data, {
					success: function(o){
						if(o.responseText){
							alert(o.responseText);
						}
						column.getMBTable().refresh();
					},
					failure: function(o){
						alert(o.statusText);
					}
				}, 'rowId=' + row.getData('id') + '&' + column.getMBTable().where);
			}
		}
	});
	c.appendChild(del.get(0));
};
YAHOO.widget.DataTable.Formatter.remove = removeFormatter;

var mbLinkFormatter = function(c, row, column, data){
	var link = $("<button>").attr("type", "button").addClass("btn btn-mini").append('<i class="icon-share"/>');
	link.attr("title", "Editer");
	link.tooltip();
	link.click(function(e){
		if(!column.data){
			alert('Missing url data');
		}else{
			if(!e.ctrlKey){
				c.innerHTML = '<img style="padding:7px 2px" src="' + WEB_STATIC_URI + 'vendor/metabot/img/loading.gif"/>';
			}
			var fieldName = 'id';
			if(column.data.fieldName){
				fieldName = column.data.fieldName;
			}
			goToPage(e.ctrlKey, column.data.section, column.data.page, row.getData(fieldName));
		}
	});
	c.appendChild(link.get(0));
};
YAHOO.widget.DataTable.Formatter.mbLink = mbLinkFormatter;


var falseOnZeroFormatter = function(c, o, column, data){
	c.style.textAlign = "center";
    if(data && data != '0'){
        c.innerHTML  = data;
    }else{
        c.innerHTML = '<span class="badge badge-important"><i class="icon-remove icon-white"/></span>';
    }
};
YAHOO.widget.DataTable.Formatter.falseOnZero = falseOnZeroFormatter;

var trueOnZeroFormatter = function(c, o, column, data){
	c.style.textAlign = "center";
    if(data && data != '0'){
        c.innerHTML  = data;
    }else{
        c.innerHTML = '<span class="badge badge-success"><i class="icon-ok icon-white"/></span>';
    }
};
YAHOO.widget.DataTable.Formatter.trueOnZero = trueOnZeroFormatter;

var imagePreviewFormatter = function(c, o, column, data){
	c.style.textAlign = "center";
    if(data){
    	if(data.match(/[?]/)){
    		data += '&';
    	}else{
    		data += '?';
    	}
    	data += 'IPFormatterVersion=' + Date.now();

    	var img = $('<img src="' + data + '" style="height:24px; border:none; vertical-align: middle;"/>');
    	$(c).append(img);
    	$(img).popover({
    		trigger: 'hover',
    		delay: 200,
    		html: true,
    		title: 'Preview',
    		placement: 'left',
    		container: 'body',
    		content: function(){ return '<img src="' + data + '"/>';}
    	});
    }else{
        c.innerHTML = ' - ';
    }
};
YAHOO.widget.DataTable.Formatter.imagePreview = imagePreviewFormatter;

var thumbFormatter = function(c, o, column, data){
	c.style.textAlign = "center";
    if(data){
    	if(data.match(/[?]/)){
    		data += '&';
    	}else{
    		data += '?';
    	}
    	data += 'IPFormatterVersion=' + Date.now();

    	var width = o.getData(column.data.widthField);
    	var height = o.getData(column.data.heightField);
    	var x = o.getData(column.data.xField);
    	var y = o.getData(column.data.yField);
    	c.innerHTML = '<div style="background-image:url(' + data + ');height:' + height + 'px; width:' + width + 'px;background-position: -' + x + 'px -' + y + 'px;border:black solid 1px;"></div>';
    }else{
        c.innerHTML = ' - ';
    }
};
YAHOO.widget.DataTable.Formatter.thumb = thumbFormatter;


var uploadFormatter = function(container, o, column, data){
	container.style.textAlign = "center";
	var form = document.createElement('form');
	form.id = id + 'Form';
	form.style.position = 'relative';
	form.style.width = '16px';
	form.style.height = '16px';
	form.style.overflow = 'hidden';
	form.style.cursor = 'pointer';
	form.action = column.data;
	form.setAttribute('method', 'POST');
	form.setAttribute('enctype', 'multipart/form-data');

	var img = document.createElement('img');
	img.setAttribute('src', WEB_STATIC_URI + 'vendor/metabot/img/icons/drive_go.png');
	img.setAttribute("style", "cursor:pointer;width:16px; height:16px; border:none; vertical-align: middle;");
	form.appendChild(img);

	input = document.createElement('input');
	input.name = id + 'File';
	input.style.position = 'absolute';
	input.style.top = '0px';
	input.style.left = '0px';
	input.style.cursor = 'pointer';
	input.setAttribute('type', 'file');
	input.setAttribute('name', 'file');
	input.style.opacity = '0';
	form.appendChild(input);
	container.appendChild(form);
	Event.addListener(input, "change", function(){
		Connect.setForm(form, true, true);
		Connect.asyncRequest('POST', column.data, {
			upload: function(o) {
				input.value = '';
				column.getMBTable().refresh();
				alert(o.responseText);
			},
			failure: function(o){
				alert(o.statusText);
			}
		}, column.getMBTable().where + '&project=' + project + '&id=' + o.getData('id'));
	});
};
YAHOO.widget.DataTable.Formatter.uploadFormatter = uploadFormatter;

var NstateFormatter = function(elCell, oRecord, oColumn, oData) {
		if (oData == 1) {
				elCell.innerHTML ='game design en cours';
		} else if (oData == 2) {
				elCell.innerHTML = 'game design fini';
		} else if (oData == 3) {
				elCell.innerHTML = 'concept-art en cours';
		} else if (oData == 4) {
				elCell.innerHTML = 'concept-art fini';
		} else if (oData == 5) {
				elCell.innerHTML = 'modèle 3D en cours';
		} else if (oData == 6) {
				elCell.innerHTML = 'modèle 3D fini';
		} else if (oData == 7) {
				elCell.innerHTML = 'texture en cours';
		} else {
				elCell.innerHTML = 'texture finie';
		}
};
YAHOO.widget.DataTable.Formatter.Nstate = NstateFormatter;

var CAstateFormatter = function(elCell, oRecord, oColumn, oData) {
		if (oData == 4) {
				elCell.innerHTML = 'validé';
		} else if (oData == 3) {
				elCell.innerHTML = 'en cours';
		} else if (oData == 5) {
				elCell.innerHTML = 'modèle 3D en cours';
		} else if (oData == 6) {
				elCell.innerHTML = 'modèle 3D validé';
		} else if (oData == 7) {
				elCell.innerHTML = 'texture en cours';
		} else if (oData == 8) {
				elCell.innerHTML = 'texture validée';
		} else {
				elCell.innerHTML = 'à faire';
		}
};
YAHOO.widget.DataTable.Formatter.CAstate = CAstateFormatter;

var M3DstateFormatter = function(elCell, oRecord, oColumn, oData) {
		if (oData == 6) {
				elCell.innerHTML = 'texture en cours';
		} else if (oData == 5) {
				elCell.innerHTML = 'en cours';
		} else if (oData == 7) {
				elCell.innerHTML = 'texture en cours';
		} else if (oData == 8) {
				elCell.innerHTML = 'texture validée';
		} else {
				elCell.innerHTML = 'à faire';
		}
};
YAHOO.widget.DataTable.Formatter.M3Dstate = M3DstateFormatter;

var maskFormater = function(elCell, oRecord, oColumn, oData) {
		if (oData == 1) {
				elCell.innerHTML = 'oui';
		} else {
				elCell.innerHTML = 'non';
		}
};
YAHOO.widget.DataTable.Formatter.mask = maskFormater;

var imgFormater = function(elCell, oRecord, oColumn, oData) {
		if (oData == 1) {
				elCell.innerHTML = '<a onclick="previewTxt(\''+ WWW_WGEN + 'textures/' +oRecord.getData('id') + '.\');">[ oui ]</a>';
		} else {
				elCell.innerHTML = 'non';
		}
};
YAHOO.widget.DataTable.Formatter.img = imgFormater;

var imgModelFormater = function(elCell, oRecord, oColumn, oData) {
		if (oData == 1) {
				elCell.innerHTML = '<a onclick="previewTxt(\''+ WWW_WGEN + 'avatars/' +oRecord.getData('id') + '.\');">[ oui ]</a>';
		} else {
				elCell.innerHTML = 'non';
		}
};
YAHOO.widget.DataTable.Formatter.imgModel = imgModelFormater;


var animCAstateFormatter = function(elCell, oRecord, oColumn, oData) {
		if (oData == 1) {
				elCell.innerHTML = 'validé';
		} else if (oData == 0) {
				elCell.innerHTML = 'en cours';
		} else {
				elCell.innerHTML = 'Animation assignée';
		}
};
YAHOO.widget.DataTable.Formatter.animCAstate = animCAstateFormatter;

var animStateFormatter = function(elCell, oRecord, oColumn, oData) {
		if (oData == 1) {
				elCell.innerHTML = 'en cours';
		} else {
				elCell.innerHTML = 'Validé';
		}
};
YAHOO.widget.DataTable.Formatter.animState = animStateFormatter;


/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/functions.js ****/
var lastAssetConfig = false;
var assetSelector;
var assetPage;
var assetSelectionFunction;
function onAssetSelection(idList){
	if(assetSelectionFunction){
		assetSelectionFunction(idList);
	}
}
var assetSelectorConfig = {
	x: 50,
	y: 50,
	visible: true,
	modal: true
};

var dialogHistory = [];
function onDialogHide(){
	dialogHistory.pop();
	var h = dialogHistory.pop();
	if(h){
		switch(h[0]){
		case 'asset':
			selectAsset(h[1], h[2], h[3]);
			break;
		case 'event':
			dialogHistory.push(['event']);
			eventDialog.show();
			break;
		}
	}
}

function selectAsset(config, onSelection, requestParam){
	dialogHistory.push(['asset', config, onSelection, requestParam]);
	if(assetSelector){
		assetSelector.parentHide();
	}
	assetSelectionFunction = onSelection;
	if(lastAssetConfig != config){
		lastAssetConfig = config;
		assetSelector = new YAHOO.widget.SimpleDialog('assetSelectionDialog', assetSelectorConfig);
		assetSelector.parentHide = assetSelector.hide;
		assetSelector.hide = function(){
			this.parentHide();
			onDialogHide();
		};
		
		assetSelector.setHeader(config.label, ' - Selection');
		assetSelector.setBody('<div style="text-align: left;position:relative"><div id="assetSelectionLoadZone" class="loadZone"><div id="assetSelectionLoadStatus" class="loadStatus"></div></div><div id="assetSelectionContentDiv" class="assetList"></div></div>');
		assetSelector.render(document.body);
		
		var customButtonList = [];
		if(config.customButtonList){
			for(var i = 0; i < config.customButtonList.length; i++){
				customButtonList.push(config.customButtonList[i]);
			}
		}
		customButtonList.push({label: "Valider la sélection", icon:"icon_accept", onclick: function(page){
				onAssetSelection(page.dataList);
				assetSelector.hide();
	   		}
		});
		assetPage = new mbPage({
			id: config.id,
			prefix: config.prefix,
			folder: config.folder,
			allowCreation: false,
			requestParam: config.requestParam + '&' + requestParam,
			recordContainerId: 'assetSelectionContentDiv',
			loadZoneId: 'assetSelectionLoadZone',
			loadStatusId: 'assetSelectionLoadStatus',
			fields: config.fields,
			filters: config.filters,
			customButtonList:customButtonList
		});
	}else{
		assetPage.requestParam = config.requestParam + '&' + requestParam;
		assetPage.update();
	}
	assetSelector.show();
}

var linkEditorDialog = false;

function createLinkEditor(config){
	var linkListTable;
	
	if(typeof(config.linkConfig) == "string"){
		config.linkConfig = eval(config.linkConfig);
	}
	var isInternal = false;
	if(!config.linkConfig){
		isInternal = true;
	}
	if(!config.assetWhere){
		config.assetWhere = '';
	}else{
		config.assetWhere = '&' + config.assetWhere;
	}
	if((typeof config.dataId) == 'object'){
		config.dataId = config.dataId.getData('id');
	}
	var table = document.createElement('table');
	table.className = "link-list";
	var tr = document.createElement('tr');
	var th = document.createElement('th');
	var tbody = document.createElement('tbody');
	var td = document.createElement('td');
	var div = document.createElement('div');

	Dom.get(config.container).appendChild(table);
	
	if(!config.noAdd){
		var thead = document.createElement('thead');

		table.appendChild(thead);
		table.setAttribute("cellspacing", 0);
		table.setAttribute("cellpadding", 0);
		thead.appendChild(tr);
		
		tr.setAttribute("vAlign", "middle");
		th = document.createElement('th');
		th.style.width = '100px';
		th.style.borderRight = 'none';
		tr.appendChild(th);
		
		th = document.createElement('th');
		th.style.padding = '4px';
		th.innerHTML = config.label + '<br/><em style="font-size:8pt;font-weight:normal">' + _2("automatically saved") + '</em>';
		th.style.borderRight = 'none';
		th.style.borderLeft = 'none';
		tr.appendChild(th);

		th = document.createElement('th');
		th.style.width = '100px';
		th.style.textAlign = 'right';
		th.style.borderLeft = 'none';
		tr.appendChild(th);
		
		var addButton = $("<span>").addClass("btn btn-primary").append('<i class="icon-plus icon-white"/> ' + _2("add")).attr("id", config.container + "AddButton");
		th.appendChild(addButton.get(0));

		addButton.click(function(){
			if(isInternal){
				editEntry();
			}else{
				var excludeList = [];
				var recordList = linkListTable.dataTable.getRecordSet().getRecords();
				for(var i = 0; i < recordList.length; i++){
					excludeList.push(recordList[i].getData('id'));
				}
				selectAsset(
					config.linkConfig,
					function(recordList){
						var idList = [];
						for(var i = 0; i < recordList.length; i++){
							idList.push(recordList[i].getData('id'));
						}
						Connect.asyncRequest('POST', 'api.php',{
							success: function(o){
								if(o.responseText){
									alert(o.responseText);
								}
								linkListTable.refresh();
							},
							failure: function(o){
								alert(o.statusText);
							}
						}, 'mbAction=LINK_ADD&' + requestWhere + '&linkList=' + idList);
					},
					'exclude=' + excludeList + config.assetWhere
				);
			}
		});
	}
	
	div.id = config.container + 'List';
	div.className = 'assetLinkContainer';
	tr = document.createElement('tr');
	table.appendChild(tbody);
	tbody.appendChild(tr);
	tr.appendChild(td);
	td.appendChild(div);
	td.setAttribute("colspan", 3);
	
	var requestWhere = 'order=' + (config.order?1:0) + '&fromType=' + 
		config.fromType + '&toType=' + config.toType + '&id=' + 
		config.dataId + '&toId=' + config.toDataId + (isInternal?'&isInternal=1':'') + 
		(config.toTypeTableName?'&toTypeTableName='+config.toTypeTableName:'') + 
		(config.typeTableName?'&typeTableName='+config.typeTableName:'') + 
		(config.typeTableField?'&typeTableField='+config.typeTableField:'') + 
		(config.tableName?'&tableName='+config.tableName:'') + 
		(config.nameField?'&nameField='+config.nameField:'') + 
		(config.where?'&where='+encodeURIComponent(config.where):'');
	
	if(config.join){
		requestWhere += '&join=' + encodeURIComponent(config.join);
	}
	if(config.checkProject){
		requestWhere += '&checkProject';
	}
	var fields = [];
	if(config.order){
		fields.push({label: '#', name: 'order', sortable: false, formatter: "order", data: 'api.php?mbAction=LINK_ORDER'});
	}
	fields.push({label: 'Id', name: 'id', sortable: false});
	if(!config.noName){
		fields.push({label: 'Nom', name: 'name', sortable: false});
	}
	if(!config.noType){
		fields.push({label: 'Type', name: 'typeName', sortable: false});
	}
	
	if(config.customFields){
		for(var i = 0; i < config.customFields.length; i++){
			var field = $.extend(true, {}, config.customFields[i]);
			if(field.type == "select" && field.table){
				fields.push(field.name);
				field.name = field.name + 'Name';
			}
			fields.push(field);
		}
	}
	if(!config.noEdit && config.customFields){
		var editEntry = function(record){
			if(record){
				$("#modal-label").html("Edition du lien " + record.getData('name'), ' - Edition');
			}else{
				$("#modal-label").html("Ajout d'un lien");
			}
			$("#modal-body").html('<form class="form-horizontal" id="link-editor-form"></form>');
			$('#modal').unbind('hide');
			$('#modal').unbind('show');
			$('#modal').unbind('hidden');
			$('#modal-close').unbind('click');
			$("#modal-close").html('Enregistrer');
			$('#modal-action').unbind('click');
			$("#modal-action").html('Annuler');
			$("#modal-action").on('click', function(){
				$("#modal").modal('hide');
			});
			$('#modal-close').on('click', function(){
				var params = requestWhere;
				if(record){
					params += '&mbAction=LINK_UPDATE&rowId=' + record.getData('id'); 
				}else{
					params += '&mbAction=LINK_ADD';
				}
				for(var i = 0; i < config.customFields.length; i++){
					var field = config.customFields[i];
					if(!field.noEdit && Dom.get("linkEditor-" + field.name)){
						if(field.type == 'checkbox'){
							if(Dom.get("linkEditor-" + field.name).checked){
								params += '&' + field.name + '=1';
							}else{
								params += '&' + field.name + '=0';
							}
						}else{
							params += '&' + field.name + '=' + encodeURIComponent(Dom.get("linkEditor-" + field.name).value);
						}
					}
				}
				Connect.asyncRequest('POST', 'api.php', {
					success: function(o){
						if(o.responseText){
							alert(o.responseText);
						}
						linkListTable.refresh();
					},
					failure: function(o){
						alert(o.statusText);
					}
				}, params);
			});
			$('#modal').on('show', function(){
				var formFields = [];
				for(var i = 0; i < config.customFields.length; i++){
					var field = config.customFields[i];
					if(!field.noEdit){
						var newField = {};
						for(var j in field){
							newField[j] = field[j];
						}
						newField.name = "linkEditor-" + newField.name;
						if(record){
							newField.value = record.getData(field.name);
						}
						formFields.push(newField);
					}
				}
				Connect.asyncRequest('POST', 'api.php', {
					success: function(o){
						$("#link-editor-form").html(o.responseText);
					},
					failure: function(o){
						alert(o.statusText);
					}
				}, 'mbAction=FORM&isModal=1&formTabs=' + encodeURIComponent(JSON.stringify(formFields)));
			});
			$("#modal").modal({show: true, backdrop: "static"});
		};
		fields.push({label: '<i class="icon-edit" title="Editer le lien"/>', name: 'editLink', sortable: false, formatter: "button", data:{
			label: "Editer le lien",
			icon: "edit",
			callback: editEntry
		}});
	}
	if(!isInternal){
		fields.push({label: '<i class="icon-share" title="Editer l\'objet"/>', name: 'edit', sortable: false, formatter: "mbLink", data: {"section":config.linkConfig.menu?config.linkConfig.menu.link:'',"page":config.linkConfig.link}});
	}
	if(!config.noDelete){
		fields.push({label: '<i class="icon-remove" title="Retirer de la liste"/>', name: 'delete', sortable: false, formatter: "remove", data: 'api.php?mbAction=LINK_DELETE'});
	}
	requestWhere += (config.customFields?'&customFields=' + encodeURIComponent(JSON.stringify(config.customFields)):'') + '&' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID;
	linkListTable = new mbDataTable({
		id: div.id,
		source: 'api.php',
		where: 'mbAction=LINK_GET&' + requestWhere,
		height: '200px',
		width: '100%',
		fields: fields,
		disableSelection: !config.onDataSelection,
		onDataSelection: config.onDataSelection,
		paginate: false,
		onUpdate: config.onUpdateHandler
	});
	return linkListTable;
}
function setCookie(cookieName, cookieValue, nDays) {
	var today = new Date();
	var expire = new Date();
	if (nDays == null || nDays == 0){
		nDays = 1;
	}
	expire.setTime(today.getTime() + 3600000 * 24 * nDays);
	document.cookie = cookieName + "=" + escape(cookieValue) + ";expires="
			+ expire.toGMTString();
}

function copy(o){
	var o2 = {};
	for(var i in o){
		o2[i] = o[i];
	}
	return o2;
}

var assetSelectionCopyData = {};
function copyAssetSelection(table, id){
	assetSelectionCopyData[table] = {value: Dom.get(id).value, text:Dom.get(id + 'Name').value};
}

function pasteAssetSelection(table, id){
	if(typeof assetSelectionCopyData[table] != "undefined"){
		Dom.get(id).value = assetSelectionCopyData[table].value;
		Dom.get(id + 'Name').value = assetSelectionCopyData[table].text; 
	}
}

var spritePreviewAnim = false;
var spriteSrc = '';
var spriteColCount = 0;
var spriteHotSpotX = -1;
var spriteHotSpotY = -1;
var spriteRowCount = 0;
var spriteFrameCount = 0;
var spritePreviewAnimCurrentFrame = 0;
var spriteImageList = [];
function createSpritePreview(src, colCount, rowCount, frameCount, frameDuration, width, height, hotSpotX, hotSpotY){
	if(typeof src == "string"){
		src = [src];
	}
	spriteImageList = [];
	for(var i = 0; i < src.length; i++){
		var img = new Image();
		img.src = src[i];
		spriteImageList.push(img); 
	}
	spriteColCount = colCount;
	spriteRowCount = rowCount;
	spriteFrameCount = parseInt(frameCount); 
	spriteHotSpotX = hotSpotX;
	spriteHotSpotY = hotSpotY;
	spriteMousePosX = 0;
	spriteMousePosY = 0;
	canvasElm = document.createElement('canvas');
	canvasElm.setAttribute("style", "cursor:crosshair");
	canvasElm.setAttribute("id", "spritePreviewCanvas");
	canvasElm.setAttribute("width", Math.round(width / colCount));
	canvasElm.setAttribute("height", Math.round(height / rowCount));
	Event.addListener(canvasElm, "mousemove", function(e){
		spriteMousePosX = e.x - Dom.getX(canvasElm);
		spriteMousePosY = e.y - Dom.getY(canvasElm);
		refreshSpritePreview();
	});
	Dom.get("preview").innerHTML = '';
	Dom.get("preview").appendChild(canvasElm);
	var link = document.createElement("a");
	link.href = src;
	link.target = "_blank";
	link.innerHTML = "Spritesheet";
	link.style.display = "block";
	link.style.margin = "10px";
	Dom.get("preview").appendChild(link);
	
	var link = document.createElement("a");
	link.href = "javascript:pauseSpritePreview(-1)";
	link.innerHTML = "<<";
	link.style.padding = "10px";
	Dom.get("preview").appendChild(link);

	link = document.createElement("a");
	link.href = "javascript:switchPlaySpritePreview()";
	link.innerHTML = "||";
	spritePauseElm = link;
	link.style.padding = "10px";
	Dom.get("preview").appendChild(link);

	link = document.createElement("a");
	link.href = "javascript:pauseSpritePreview(1)";
	link.innerHTML = ">>";
	link.style.padding = "10px";
	Dom.get("preview").appendChild(link);
	
	if(spritePreviewAnim){
		clearInterval(spritePreviewAnim);
	}
	spritePreviewAnimCurrentFrame = 0;
	spriteFrameDuration = frameDuration;
	playSpritePreview();
}

function playSpritePreview(){
	spritePauseElm.innerHTML = " || ";
	if(spriteFrameDuration > 0 && (spriteColCount > 1 || spriteRowCount > 1)){
		spritePreviewAnim = setInterval('nextSpriteFrame()', spriteFrameDuration);
	}else{
		refreshSpritePreview();
	}
}
function pauseSpritePreview(moveSprite){
	spritePauseElm.innerHTML = " > ";
	if(spritePreviewAnim){
		clearInterval(spritePreviewAnim);
		spritePreviewAnim = false;
	}
	if(moveSprite){
		spritePreviewAnimCurrentFrame += moveSprite;
		refreshSpritePreview();
	}
}
function switchPlaySpritePreview(){
	if(spritePreviewAnim){
		pauseSpritePreview();
	}else{
		playSpritePreview();
	}
}

function nextSpriteFrame(){
	spritePreviewAnimCurrentFrame = (spritePreviewAnimCurrentFrame + 1) % (spriteFrameCount);
	refreshSpritePreview();
}
function refreshSpritePreview(){
	var g = canvasElm.getContext('2d');
	g.clearRect(0, 0, canvasElm.width, canvasElm.height);
	spritePreviewAnimCurrentFrame = (spritePreviewAnimCurrentFrame + spriteFrameCount) % spriteFrameCount;
	
	var col = spritePreviewAnimCurrentFrame % spriteColCount;
	var row = Math.floor(spritePreviewAnimCurrentFrame / spriteColCount);
	for(var i = 0; i < spriteImageList.length; i++){
		g.drawImage(spriteImageList[i], -col * canvasElm.width, -row * canvasElm.height);
	}

	g.textAlign = 'left';
	g.fillText(spritePreviewAnimCurrentFrame, 2, 10);

	var y = canvasElm.height;
	for(var i = 0; i < spriteImageList.length; i++){
		y -= 20;
		g.fillText(spriteImageList[i].width + "x" + spriteImageList[i].height, 2, y);
	}
	
	g.textAlign = 'right';
	g.fillText(spriteMousePosX + "," + spriteMousePosY, canvasElm.width - 2, 10);
	
	var size = 5;
	if(spriteHotSpotX >= 0 && spriteHotSpotY >= 0){
		g.fillStyle = 'rgba(255, 0, 0, 0.5)';
		g.fillRect(spriteHotSpotX - size / 2, spriteHotSpotY - size / 2, size, size);
	}
}
var highlightEditableCell = function(oArgs) { 
	var elCell = oArgs.target; 
	if(YAHOO.util.Dom.hasClass(elCell, "yui-dt-editable")) { 
		this.highlightCell(elCell); 
	} 
};

(function(MetaBot){
	MetaBot.loadProject = function(id){
		location.href = "?" + MetaBot.PROJECT_FIELD_NAME + "=" + id; 
	};
	
	MetaBot.renderSprite = function(canvas){
		var path = canvas.getAttribute('data-path');
		var frameCount = canvas.getAttribute('data-frame-count');
		if(parseInt(frameCount) != frameCount){
			frameCount = $("#" + frameCount).val();
		}
		var frameRate = canvas.getAttribute('data-frame-rate');
		if(parseInt(frameRate) != frameRate){
			frameRate = $("#" + frameRate).val();
		}
		var frameDelay = Math.round(1000 / frameRate);
		var g = canvas.getContext('2d');
		var img = new Image();
		img.src = path;
		var onload = function(){
			canvas.width = Math.round(img.width / frameCount);
			canvas.height = img.height;
			var currentFrame = -1;
			var paint = function(){
				if(document.contains(canvas)){
					currentFrame = (currentFrame + 1) % frameCount;
					g.clearRect(0, 0, canvas.width, canvas.height);
					g.drawImage(img, currentFrame * canvas.width, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
					if(canvas.parentNode){
						setTimeout(paint, frameDelay);
					}
				}
			}; 
			paint();
		};
		if(img.complete){
			onload();
		}else{
			img.onload = onload;
		}
	};
})(window.MetaBot = window.MetaBot || {});

if(typeof(_2) == "undefined"){
	_2 = function(s){
		return s;
	};
}


/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/init.js ****/
(function(MetaBot, $, undefined){
	var now = new Date();
	MetaBot.Date = {
		getDateInfo: function(date){
			var res = {
				obj: date,
				time: Math.floor(date.getTime() / 1000),
				timemillis: date.getTime(),
				month: date.getMonth() + 1,
				day: date.getDate(),
				year: date.getFullYear()
			};
			res.paddedMonth = res.month < 10 ? "0" + res.month : res.month;
			res.paddedDay = res.day < 10 ? "0" + res.day : res.day;
			res.date = res.year + "-" + res.paddedMonth + "-" + res.paddedDay;
			res.monthStartDate = res.year + "-" + res.paddedMonth + "-01";
			return res;

		}
	};
	MetaBot.Date.now = MetaBot.Date.getDateInfo(new Date());
	MetaBot.Date.yesterday = MetaBot.Date.getDateInfo(new Date(MetaBot.Date.now.timemillis - 3600 * 24 * 1000));
})(window.MetaBot = window.MetaBot || {}, window.jQuery);

$(document).ready(function(){

	if(typeof(console) == "undefined"){
		console = {
			log: function(s){}	
		};
	}
	
	MetaBot.MenuLayout.render();
//	
//	for(var i in mbMenu_buttons){
//		var button = mbMenu_buttons[i];
//		
//		if(button.noProject && $('#noproject-menu').get(0)){
//			$parent = $('#noproject-menu');
//		}else{
//			$parent = $('#menu');
//		}
//		
//		button.initButton($parent);
//	}
});


/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbChart.js ****/
(function(MetaBot, $, undefined){

MetaBot.Chart = function(container, title, axisTitle, type){
	this.title = title;
	this.container = container;
	this.axisTitle = axisTitle;
	this.type = type;
};
MetaBot.Chart.prototype.update = function(data){
	var config = {
		chart: {
			zoomType: 'x'
		},
		title: {
			text: this.title
		},
		xAxis: {
			title: {
				text: null
			},
			categories: data.categories
		},
		yAxis: [
			{
				title: {
					text: this.axisTitle
				}
			}
		],
		tooltip: {
			shared: true
		},
		legend: {
			enabled: true
		},
		plotOptions: {
			area: {
				stacking: 'normal',
				lineWidth: 3,
				marker: {
					lineWidth: 1
				},
				fillOpacity: 0.75
			}
		},
		series: data.series
	};
	if (this.type) {
		config.chart.type = this.type;
	}
	this.chart = $("#" + this.container).highcharts(config);
};

})(window.MetaBot = window.MetaBot || {}, window.jQuery);

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbDataTable.js ****/
var mbDataTable_table = 0;

// Fonction de création de table à part entière.
function mbDataTable(config){
	var _this = this;
	var gObject = this;
	
	this.table = 'mbDataTable_' + ++mbDataTable_table;
	
	this.onDataSelection = 		config.onDataSelection;
	this.source = 				config.source;
	this.where = 				typeof(config.where) != 'undefined' ? config.where : '';
	this.header = 				config.header ? config.header : 'data';
	this.fields =				config.fields;
	this.rowsPerPage =			config.rowsPerPage ? config.rowsPerPage : 10;
	this.width =				config.width ? config.width : '';
	this.height =				config.height ? config.height : '';
	this.id =					config.id;
	this.search =				config.search;
	this.disableSelection =		config.disableSelection;
	this.paginate =				(typeof(config.paginate) != 'undefined' ? config.paginate : true);
	this.firstAndLast =			config.firstAndLast ? config.firstAndLast : true;
	this.selectedId = 			(typeof(config.selectedId) != 'undefined' ? config.selectedId : 0);
	this.onUpdate =				config.onUpdate ? config.onUpdate : false;
	
	this.columns =				[];
	this.fieldNames = 			[];	
	//this.select =				0;					// Id de l'élément à sélectionner.
	//this.ready =				false;
	this.numId =				mbDataTable_table;	// permet de gérer plusieurs dataTables par page
	
	this.hasFilters =			false;	// permet de savoir si le conteneur réservé aux filtres a déjà été construit
	this.filters =				config.filters ? config.filters : [];			// Filtres.	
	this.filtersValue =			new Array();									// Valeurs des différents filtres.
	
	this.getData = function(){
		var data = [];
		for(var i = 0; i < this.dataTable.getRecordSet().getLength(); i++){
			data.push(this.dataTable.getRecordSet().getRecord(i).getData());
		}
		return data;
	};
	
	// Création de la zone contenant les filtres de la page (haut).
	this.createFiltersContainer = function(){
		// Si on n'a pas encore de filtre, on ajoute la zone où ceux-ci seront ajoutés.
		if (!this.hasFilters){
			this.hasFilters = true;
			
			var div = document.createElement('div');
			div.setAttribute('style', 'margin: 4px 0; padding: 4px; background-color: #CDE9EF');
			div.setAttribute('id', this.id + '_' + this.numId + 'Filters');
			div.className = 'filters';
			Dom.get(this.numId + 'FiltersContainer').appendChild(div);
		}
	};
	
	this.addFilter = function(config){
		this.createFiltersContainer();
				
		// configuration (config)
		var label =	config.label;
		var field = config.field;
		var id = config.id ? config.id : 'filter' + field;
		var table = config.table ? config.table : '';
		var where = config.where ? config.where : '';
		var icon = config.icon;
		var hasProject = typeof(config.hasProject) != 'undefined' ? config.hasProject : true;
		var hasParents = config.hasParents ? '1' : '0';
		var sortByLetter = config.sortByLetter ? '1' : '0';
		var minHeight = config.minHeight ? config.minHeight : 90;
		var maxHeight = config.maxHeight ? config.maxHeight : (parseInt(topPanel.getStyle('height'))-120);
		
		// FILTRE CLASSIQUE (voir mbPage si besoin d'autres types de filtres: bool, custom, etc.)
		
		// Ajoute le bouton.
		var input = document.createElement('input');
		input.setAttribute('type', 'button');
		input.setAttribute('id', this.id + '_' + id);
		input.setAttribute('value', label);		
		Dom.get(this.id + '_' + this.numId + 'Filters').appendChild(input);
		
		// on récupère la data pour le contenu du filtre
		Connect.asyncRequest('post', 'ajax/getFilter.php', {
			success: function(o){
				var items = YAHOO.lang.JSON.parse(o.responseText);
				// Création du bouton avec menu.
				var button = new YAHOO.widget.Button(this.id + '_' + id, { 
					type: 'menu', 
					menu: items,
					menuminscrollheight: minHeight,
					menumaxheight: maxHeight
				});
				// Rajoute récursivement l'action au clic sur l'item permettant de sélectionner une valeur.
				function addOnclick(items, scope){
					for (var i in items){
						items[i].onclick = {
							fn: function(p_sType, p_aArgs, p_oItem){
								this.filtersValue[field] = p_oItem.value;		// Conserve la valeur actuelle du champ.
								
								// Si a une sélection non nulle, on précise, sinon on affiche seulement le label.
								if (p_oItem.value != 0){
									button.set("label", '<b>' + label + '</b> [<i style="font-size:smaller">' + p_oItem.cfg.getProperty("text") + '</i>]');
								}else{
									button.set("label", label);
								}
															
								this.refresh('', true);		// Mise à jour de la table.
							},
							scope: scope
						};

						// Si on a des sous-menus, on relance la fonction avec ceux-ci.
						if (items[i].submenu){
							addOnclick(items[i].submenu.itemData, scope);
						}
					}
				}				

				addOnclick(items, this);
				
				// Ajoute une icône si possible.
				if (icon){
					button.addClass('icon_' + icon);
				}
			},
			failure: function(o){
				alert(o.responseText);
			},
			scope: this
		}, 'project=' + project + '&hasProject=' + (hasProject ? '1' : '0') + '&hasParents=' + hasParents + '&table=' + table + (where ? '&where=' + where : '') + '&sortByLetter=' + sortByLetter);
	};
	
	// On créé la liste des colonnes.
	for (var i in this.fields){
		var name = false;
				
		// Si on un objet, on récupère le champ name.		
		if (typeof(this.fields[i]) == 'object'){
			// Si le champ est bien défini.
			if (typeof(this.fields[i].name) != 'undefined')
			{
				name = this.fields[i].name;
			}
		}else{
			name = this.fields[i];
		}			
		
		// Ajoute à la liste des noms de champs, si on a bien une donnée..
		if (name.length > 0){
			this.fieldNames.push(name);
		}

		var formatter = this.fields[i].formatter;
		
		// Ajoute un formatter automatique pour permettre la sélection de lignes.
		if (name == 'id'){			
			formatter = function(cell, record){
				var container = document.createElement('div');
				container.setAttribute('id', gObject.table + '_' + record.getData('id'));
				container.innerHTML = record.getData('id');					
				cell.appendChild(container);
			};
		}
		
		// Ajoute des colonnes.
		if (typeof(this.fields[i]) == 'object'){
			this.columns.push({
				key: name,
				label: this.fields[i].label,
				formatter: formatter,
				sortable: typeof(this.fields[i].sortable) == 'undefined'?true:this.fields[i].sortable,
				resizeable: typeof(this.fields[i].resizeable) == 'undefined'?true:this.fields[i].resizeable,
				data: this.fields[i].data,
				getMBTable: function(){ return gObject;}
			});
		}
	}
	
	this.dataSource = new YAHOO.util.DataSource(this.source);
	this.dataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
	this.dataSource.connXhrMode = "queueRequests";
	
	// Si on a un chemin jusqu'au données, on l'indique à la dataSource.
	this.dataSource.responseSchema = 
	{
		resultsList: this.header,
		fields: this.fieldNames
	};

	if(this.paginate){
		// Pagination.
		var paginatorTemplate = '{Bootstrap} {BootstrapRowsPerPageDropdown}';
		
		this.paginator = new YAHOO.widget.Paginator({
		    rowsPerPage: this.rowsPerPage,
		    alwaysVisible : true,
		    pageLinks: 5,
		    template: paginatorTemplate,
		    rowsPerPageOptions: [5, 10, 25, 50]
		});
	}else{
		this.paginator = false;
	}
	
	// Création d'une nouvelle boîte pour contenir la table.
	var div = document.createElement('div');
	div.setAttribute('id','mbDataTable_' + this.numId);
	div.className = 'mbDataTable';
	
	var container = Dom.get(this.id);
	
	// Petit check de l'ID donnée.
	if (container){		
		// Si on gère un champ de recherche...
		if (this.search){
			var searchContainer = document.createElement('div');
			searchContainer.setAttribute('style', 'margin: 4px');
			
			var searchLabel = document.createElement('label');
			searchLabel.innerHTML = 'Recherche : ';
			searchLabel.setAttribute('for', 'mbDataTable_' + this.numId + '_search');
			
			searchContainer.appendChild(searchLabel);
			
			var searchField = document.createElement('input');
			searchField.setAttribute('type', 'text');
			searchField.setAttribute('id', 'mbDataTable_' + this.numId + '_search');
			searchField.style.width = '150px';
			
			// Au changement de texte, on relance la requête.
			Event.addListener(searchField, 'keyup', function(){
				var keyword = Dom.get('mbDataTable_' + this.numId + '_search').value;
				this.searchRequest = keyword;
				this.refresh('', true);
			},
			this,
			true);
			
			searchContainer.appendChild(searchField);
			
			container.appendChild(searchContainer);
		}
		
		if(this.filters.length > 0){
			// Zone d'accueil des filtres.
			var filter = document.createElement('div');
			filter.setAttribute('style', 'margin: 4px');
			filter.setAttribute('id', this.numId + 'FiltersContainer');
			container.appendChild(filter);
		}
		
		container.appendChild(div);
	}else{
		alert('Impossible de sélectionnée l\'élément d\'ID "' + this.id + '"');
	}
	
	// Ajoute les filtres.
	for (var i = 0; i < this.filters.length; i++){		
		this.addFilter(this.filters[i]);
	}	
	
	this.setWhere = function(where){
		this.where = where;
		this.initialRequest = '?project=' + project + (this.where ? '&' + this.where : '');
	};
	
	this.setWhere(this.where);
	this.filterRequest = '';
	this.searchRequest = '';
	this.dataTable = new YAHOO.widget.DataTable(
		'mbDataTable_' + this.numId, 
		this.columns, 
		this.dataSource, {
			initialRequest: this.initialRequest,
			paginator: this.paginator
		});

	this.dataSource.subscribe("dataErrorEvent", function(o){
		_this.dataTable.showTableMessage("Error : " + o.response.responseText);
	});
	
	var dataTable = this.dataTable;
	var paginator = this.paginator;
	
	// Rafraîchit le contenu de la page.
	// where -> paramètres de la requête à effectuer.
	// keep -> indique si l'on conserve ou non les paramètres initiaux du champ where.
	this.refresh = function(where, keep){
		if(typeof(where) == 'undefined'){
			where = '';
		}
		if(typeof(keep) == 'undefined'){
			keep = true;
		}
		this.filterRequest = '';
		
		// On ajoute tous les filtres.
		for (i in this.filtersValue)
		{
			// si on a sélectionné autre chose que le choix "Tous"
			if(this.filtersValue[i] != 0)
			{
				this.filterRequest += '&' + i + '=' + this.filtersValue[i];
			}
		}
		
		this.dataSource.sendRequest((keep ? this.initialRequest + (this.filterRequest != '' ? this.filterRequest : '') + (this.searchRequest != '' ? '&search=' + this.searchRequest : '') + (where ? '&' + where : '') :  (where ? '?' + where : '')),
		{
		    success : function(oRequest , oResponse , oPayload)
		    {
		    	var sortedBy = dataTable.get('sortedBy');
		    	
		    	dataTable.onDataReturnInitializeTable(oRequest , oResponse , oPayload);

		    	if(paginator){
			    	paginator.set('totalRecords',  oResponse.results.length);
			    	paginator.setPage(1);
		    	}
		    	
		    	if (sortedBy){
		    		dataTable.sortColumn(dataTable.getColumn(sortedBy.key), sortedBy.dir);
		    	}
		    	
		    	var newElementNb = dataTable.getRecordSet().getLength();

		    	if(!gObject.disableSelection){
					var selectedRow =			dataTable.getSelectedRows();
			    	var selectedId = 			-1;
			    	var page = 					1;
			    	if(paginator){
			    		page = paginator.getCurrentPage();
			    	}
	
			    	if (selectedRow.length > 0){
			    		selectedId = dataTable.getRecord(selectedRow[0]).getData('id');
			    	}
			    	var currentElementNb = dataTable.getRecordSet().getLength();
					if (newElementNb == currentElementNb + 1){
			    		var maxID = '0';
			    		var rowToSelect = '0';
			    		var pageToSelect = '1';
			    						
			    		for(i = 0; i < newElementNb; i++)
			    		{
			    			if(dataTable.getRecord(i).getData('id') > maxID)
			    			{
			    				maxID = dataTable.getRecord(i).getData('id');
			    				rowToSelect = i;
			    				if(paginator){
			    					pageToSelect = Math.floor(i / paginator.getRowsPerPage()) + 1;
			    				}else{
			    					pageToSelect = 1;
			    				}
			    			}
			    		}

			    		dataTable.selectRow(rowToSelect);
			    		if(paginator){
			    			paginator.setPage(pageToSelect);
			    		}
			    	}else{
			    		if(selectedId >= 0){
			    			for(i = 0; i < newElementNb; i++)
			    			{
			    				if(dataTable.getRecord(i).getData('id') == selectedId)
			    				{
			    					if(paginator){
			    						paginator.setPage(Math.floor(i / paginator.getRowsPerPage()) + 1);
			    					}
			    					dataTable.selectRow(i);
			    					break;
			    				}
			    			}
			    			
			    			// Si on n'a pas encore pu configurer la page
							// sélectionnée (élément supprimé par exemple), on le
							// fait ici.
			    			if(paginator){
				    			if (page >  paginator.getTotalPages()){
				    				paginator.setPage(page - 1);    				
				    			}else{
				    				if (page != 1){
				    					paginator.setPage(page);
				    				}
				    			}
			    			}
			    		}
			    	}
		    	}
		    	if(_this.onUpdate){
		    		_this.onUpdate();
		    	}
		    },
		    failure : dataTable.onDataReturnInitializeTable, 
		    scope : dataTable
		});
	};
	this.dataTable.subscribe("rowMouseoverEvent", this.dataTable.onEventHighlightRow);
	this.dataTable.subscribe("rowMouseoutEvent", this.dataTable.onEventUnhighlightRow);
	if(!this.disableSelection){
		this.dataTable.subscribe("rowClickEvent", this.dataTable.onEventSelectRow);			
		this.dataTable.subscribe("rowSelectEvent", function()
		{
			var selectedRows = this.getSelectedRows();
			var dataList = [];
			for(var i = 0; i < selectedRows.length; i++){
				dataList.push(this.getRecordSet().getRecord(selectedRows[i]));
			}
			gObject.onDataSelection(dataList[0], dataList);
		});	
	}
	
	// Evènement appelé une fois la DataTable prête à être utilisée.
	this.dataTable.subscribe("initEvent", function(){
		if (!gObject.disableSelection && gObject.selectedId > 0){
		    var records = this.getRecordSet()._records;
		    var count = 0;
	
		    // On examine chaque enregistrement.
		    for (i in records){
		    	count++;
		        if (records[i].getData('id') == gObject.selectedId){
		            this.selectRow(records[i]);
		            break;
		        }
		    }
		    
		    // On sélectionne la page à laquelle se trouve l'item sélectionné.
		    if(paginator){
		    	gObject.paginator.setPage(Math.floor(count / gObject.rowsPerPage) + 1,false);
		    }
		}
    	if(_this.onUpdate){
    		_this.onUpdate();
    	}
	});
}

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbDateChart.js ****/
(function(MetaBot, $, undefined){

MetaBot.DateChart = function(container, title, axisTitle){
	this.title = title;
	this.container = container;
	this.axisTitle = axisTitle;
};
MetaBot.DateChart.prototype.update = function(data){
	for(var i = 0; i < data.series.length; i++){
		data.series[i].pointInterval = data.pointInterval;
		data.series[i].pointStart = Date.UTC(2012, 5, 1);
	}
	this.chart = $("#" + this.container).highcharts({
		chart: {
			zoomType: 'x'
		},
		title: {
			text: this.title
		},
		xAxis: {
			type: 'datetime',
			maxZoom: 24 * 3600000,
			title: {
				text: null
			}
		},
		yAxis: [
			{
				title: {
					text: this.axisTitle
				}
			}
		],
		tooltip: {
			shared: true
		},
		legend: {
			enabled: true
		},
		plotOptions: {
			area: {
				stacking: 'normal',
				lineWidth: 3,
				marker: {
					lineWidth: 1
				},
				fillOpacity: 0.75
			}
		},
		series: data.series
	});
};

})(window.MetaBot = window.MetaBot || {}, window.jQuery);

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbForm.js ****/
// Classe pour la création de formulaire à la volée en JavaScript.
// formName -> Nom du formulaire.
// title -> Titre affiché.
// id -> identifieur de l'élément HTML où insérer le formulaire.
	
// Constantes référant aux types des contrôles du formulaire.
var MBF_INPUT = 1;
var MBF_CHECKBOX = 2;
var MBF_TEXTAREA = 3;
var MBF_COMBOBOX = 4;
var MBF_LISTBOX = 5;
var MBF_FORMULA_INPUT = 6;
function mbForm(name, title, parent)
{
	
	var gObject = this;
	
	this.name = 		name;			// Nom du formulaire.
	this.fields = 		new Array();	// Tableau associant les noms de données aux éléments du formulaire.
	this.title =		title;			// Titre du formulaire.
	this.id = 			parent;			// Id de l'élément parent du form.
	
	var element =		null;			// Id de l'élément édité dans le formulaire.	
	
	this.params = 		new Array();

	// Récupère le contenu informatif d'un des champs (exemple : liste des items d'une combobox).	
	this.getFieldContent = function(field)
	{
		return this.fields[field].content;
	};
	
	// On supprime l'ancien code
	Dom.get(this.id).innerHTML = '';

	// On insère le code HTML du formulaire
	Dom.get(this.id).innerHTML = 
	'<form class="pb-form" id="' + this.name + '" name="' + this.name + '" method="post">' +
	'	<table>' +
	'		<thead>' +
	'			<tr>' +
	'				<th colspan="2">' + 
						this.title + 
	'				</th>' + 
	'			</tr>' + 
	'		</thead>' + 
	'		<tbody id="' + this.name + 'Body">' + 
	'		</tbody>' +
	'		<tfoot>' +
	'			<tr>' + 
	'				<td colspan="2" id="' + this.name + 'Footer">' + 
	'				</td>' +
	'			</tr>' +
	'		</tfoot>' + 
	'	</table>' + 
	'</form>';
	
	// Ajoute les données depuis un Record YUI.
	this.fillFromRecord = function(data)
	{
		for (i in this.fields)
		{
			if (i != null)
			{
				switch (this.fields[i].type)
				{
					case MBF_FORMULA_INPUT:
					case MBF_INPUT:
					case MBF_TEXTAREA:
					case MBF_COMBOBOX:
					case MBF_LISTBOX:
						Dom.get(this.fields[i].id).value = data.getData(i);
					break;
					
					case MBF_CHECKBOX:
						if (data.getData(i) == 1) Dom.get(this.fields[i].id).checked = true; 
					break;
				}
			}
		}
	};
	
	// Ajoute les données depuis un appel de fichier asynchrone.
	this.fillFromFile = function(file, elementId, callback)
	{		
		element = elementId;
		var gObject = this;
		
		// On se connecte au fichier permettant de récupérer les données de l'item dont l'ID est précisé.
		Connect.asyncRequest('POST', file,
		{
			success: function(o)
			{			
				gObject.fillFromData(YAHOO.lang.JSON.parse(o.responseText), callback);
			},
			failure: function(o)
			{
				alert(o.statusText);
			}
		},'project=' + project + '&id=' + element);
	};
	this.fillFromData = function(content, callback){		
		var fields = this.fields;
		// Pour chaque élément du tableau JSON anonyme...
		for (i in fields){
			if (i != null){
				switch (fields[i].type){
					case MBF_COMBOBOX:
						var found = false;
						for(var j = 0; !found && j < Dom.get(fields[i].id).options.length; j++){
							if(Dom.get(fields[i].id).options[j].value == content[i]){
								found = true;
							}
						}
						if(!found){
							var opt = document.createElement("option");
							opt.setAttribute("value", content[i]);
							opt.innerHTML = "Valeur à fixer";
							Dom.get(fields[i].id).appendChild(opt);
						}
					case MBF_LISTBOX:
					case MBF_FORMULA_INPUT:
					case MBF_INPUT:
					case MBF_TEXTAREA:
						Dom.get(fields[i].id).value = content[i];
					break;
					
					case MBF_CHECKBOX:
						if (content[i] == 1){
							Dom.get(fields[i].id).checked = true;
						}
					break;
				}
			}
		}
		
		if (callback){
			content.forFill = true;
			callback(content);
		}
	};
	
	// Ajoute un champ de texte simple.
	this.addInput = function(label, id, field)
	{
		this.fields[field] = {id: id, type: MBF_INPUT};
		
		var tr = document.createElement('tr');
		tr.setAttribute('id', id + 'Row');
		
		var tdLeft = document.createElement('td');
		var tdRight = document.createElement('td');
		
		var labelElement = document.createElement('label');
		labelElement.setAttribute('id', id + 'Label');
		labelElement.setAttribute('for', id);
		labelElement.innerHTML = label;
		tdLeft.appendChild(labelElement);
		tr.appendChild(tdLeft);
		
		var inputElement = document.createElement("input");
		inputElement.setAttribute("type", "text");
		inputElement.setAttribute("style", "width:290px");
		inputElement.setAttribute("name", field);
		inputElement.setAttribute("id", id);
		tdRight.appendChild(inputElement);
		tr.appendChild(tdRight);
		Dom.get(this.name + 'Body').appendChild(tr);
	};
	
	// Ajoute un champ de texte pour formule.
	this.addFormulaInput = function(label, id, field)
	{
		this.fields[field] = {id: id, type: MBF_FORMULA_INPUT};
		
		var tr = document.createElement('tr');
		tr.setAttribute('id', id + 'Row');
		
		var tdLeft = document.createElement('td');
		var tdRight = document.createElement('td');
		
		var labelElement = document.createElement('label');
		labelElement.setAttribute('id', id + 'Label');
		labelElement.setAttribute('for', id);
		labelElement.innerHTML = label;
		tdLeft.appendChild(labelElement);
		tr.appendChild(tdLeft);
		
		var inputElement = createFormulaInput(field, '', "290px", id, true);
		tdRight.appendChild(inputElement);
		tr.appendChild(tdRight);
		Dom.get(this.name + 'Body').appendChild(tr);
	};
	
	// Ajoute un champ de texte multiligne.
	this.addTextarea = function(label, id, field)
	{
		this.fields[field] = {id: id, type: MBF_TEXTAREA};
		
		var tr = document.createElement("tr");
		var tdLeft = document.createElement("td");
		var tdRight = document.createElement("td");
		
		var labelElement = document.createElement("label");
		labelElement.setAttribute("for", id);
		labelElement.innerHTML = label;
		tdLeft.appendChild(labelElement);
		tr.appendChild(tdLeft);
		
		var textareaElement = document.createElement("textarea");
		textareaElement.setAttribute("name", field);
		textareaElement.setAttribute("id", id);
		tdRight.appendChild(textareaElement);
		tr.appendChild(tdRight);
		Dom.get(this.name + 'Body').appendChild(tr);
	};

	// Ajoute une combobox.
	this.addCombobox = function(label, id, field, file, onchange, onload, allowNull)
	{
		this.fields[field] = {id: id, type: MBF_COMBOBOX, content: null };

		var tr = document.createElement("tr");
		tr.setAttribute('id', id + 'Row');
		
		var tdLeft = document.createElement("td");
		var tdRight = document.createElement("td");
		
		var labelElement = document.createElement('label');
		labelElement.setAttribute("id", id + 'Label');
		labelElement.setAttribute("for", id);
		labelElement.innerHTML = label;
		tdLeft.appendChild(labelElement);
		tr.appendChild(tdLeft);
		
		var selectElement = document.createElement('select');
		selectElement.setAttribute("name", field);
		selectElement.setAttribute("id", id);
		if(allowNull){
			selectElement.innerHTML = '<option value="0">Aucun</option>';
		}
		tdRight.appendChild(selectElement);
		tr.appendChild(tdRight);
		Event.addListener(selectElement, 'change', onchange);
		Dom.get(this.name + 'Body').appendChild(tr);
		gObject.fields[field].content = new Array();
			
		if(file){
			// On récupère les différentes options de l'élément.
			Connect.asyncRequest('POST', file,
			{
				success: function(o){
					// Récupère et associe le contenu au champ.
					var content = YAHOO.lang.JSON.parse(o.responseText);
					if(Dom.get(id)){
						var oldValue = Dom.get(id).value;
					
						// Ajoute tous les éléments au select et au contenu objet.
						for (i in content){
							var c_id = content[i].id ? content[i].id : content[i].value; 
							var c_name = content[i].name ? content[i].name : content[i].text;
													
							if (i != null){
								for(var j = 0; j < Dom.get(id).options.length; j++){
									if(Dom.get(id).options[j].value == c_id){
										Dom.get(id).removeChild(Dom.get(id).options[j]);
									}
								}
								Dom.get(id).innerHTML += '<option value="' + c_id + '">[' + c_id + '] ' + c_name + '</option>';
								
								// Création d'un tableau associatif ID => Contenu.
								gObject.fields[field].content[c_id] = content[i];
							}
						}
						Dom.get(id).value = oldValue;
					}
					
					// On traite une fonction après chargement.
					if (onload != null){
						onload();
					}
				},
				failure: function(o)
				{
					alert(o.statusText);
				}
			},'project=' + project);
		}

		// Si on a une fonction non nulle, on l'ajoute dans l'évènement de changement d'élément.
		if (onchange != null){
			Event.addListener(id, 'change', onchange);
		}
	};
	
	// Ajoute une checkbox.
	this.addCheckbox = function(label, id, field){
		this.fields[field] = {id: id, type: MBF_CHECKBOX};
		
		var tr = document.createElement("tr");
		tr.setAttribute('id', id + 'Row');
		
		var tdLeft = document.createElement("td");
		var tdRight = document.createElement("td");
		
		var labelElement = document.createElement("label");
		labelElement.setAttribute('id', id + 'Label');
		labelElement.setAttribute("for", id);
		labelElement.innerHTML = label;
		tdLeft.appendChild(labelElement);
		tr.appendChild(tdLeft);
		
		var inputElement = document.createElement("input");
		inputElement.setAttribute("name", field);
		inputElement.setAttribute("id", id);
		inputElement.setAttribute("type", "checkbox");
		tdRight.appendChild(inputElement);
		tr.appendChild(tdRight);
		Dom.get(this.name + 'Body').appendChild(tr);
	};
	
	// Ajoute un bouton d'enregistrement.
	this.addUpdateButton = function(label, id, file, callback)
	{		
	    var button = new YAHOO.widget.Button(
	    {
	    	id: id, 
	    	type: "button", 
	    	label: label, 
	      	container: this.name + 'Footer' 
	    });
	    
	    var name = this.name;
	    
	    button.addClass('icon_disk');
	    button.on('click', function()
	    {
			// On dresse la liste des données supplémentaires à transmettre.
			var paramList = '';
			for (var i in this.params)
			{
				paramList += '&' + i + '=' + this.params[i];
			}
	    	Connect.setForm(Dom.get(name));
			Connect.asyncRequest('POST', file,
			{
				success: function(o)
				{
					if(o.responseText == element)
					{
						alert('La condition #' + o.responseText + ' a été modifiée avec succès!');
					}
					if (callback){
						callback();
					}
				},
				failure: function(o)
				{
					alert(o.statusText);
				}
			},'project=' + project + '&id=' + element + paramList);
	    },
	    this,
	    true);
	};
	
	// Ajoute un bouton de suppression.
	this.addDeleteButton = function(label, id, file, callback, requestParams)
	{
	    var button = new YAHOO.widget.Button(
	    {
            id: id, 
            type: "button", 
            label: label, 
            container: this.name + 'Footer' 
        });
	    
	    button.addClass('icon_delete');
	    button.on('click', function()
	    {
			Connect.asyncRequest('POST', file,
			{
				success: function(o){
					alert(o.responseText);
					if (callback){
						callback();
					}
				},
				failure: function(o)
				{
					alert(o.statusText);
				}
			},'project=' + project + '&id=' + element + (requestParams != '' ? '&' + requestParams : ''));
	    });
	};
		
	// On switche vers un autre type de contrôle.
	this.switchTo = function(id, to, fill)
	{
		var name = Dom.get(id).name;
		var value = Dom.get(id).value;
		var parent = Dom.get(id).parentNode; 
		while(parent.nodeName != "TD"){
			parent = parent.parentNode;
		}
		parent.innerHTML = '';

		var child = false;
		
		switch (to)
		{
			case MBF_COMBOBOX:
			{				
				child = document.createElement('select');
				child.setAttribute('id', id);
				child.setAttribute('name', name);
				child.setAttribute('value', value);
				child.innerHTML = fill;
			}
			break;
			
			case MBF_INPUT:
			{
				child = document.createElement('input');
				child.setAttribute('id', id);
				child.setAttribute('name', name);
				child.setAttribute('value', value);
			}
			break;
			
			case MBF_FORMULA_INPUT:
			{
				child = createFormulaInput(name, value, "290px", id);
			}
			break;
		}
	
		if(child){
			parent.appendChild(child);
		}
	};
	
	// Ajoute une listbox.
	this.addListbox = function(label, id, field, file, fields, onclick)
	{
		this.fields[field] = {id: id, type: MBF_LISTBOX };

		var tr = document.createElement("tr");
		tr.setAttribute('id', id + 'Row');
		var tdLeft = document.createElement("td");
		var tdRight = document.createElement("td");
		
		var labelElement = document.createElement("label");
		labelElement.setAttribute("for", id);
		labelElement.innerHTML = label;
		tdLeft.appendChild(labelElement);
		tr.appendChild(tdLeft);
		
		var selectElement = document.createElement("select");
		selectElement.setAttribute("name", field);
		selectElement.setAttribute("id", id);
		selectElement.setAttribute("size", fields);
		tdRight.appendChild(selectElement);
		tr.appendChild(tdRight);
		Event.addListener(selectElement, 'click', onclick);
		Dom.get(this.name + 'Body').appendChild(tr);
		
		Connect.asyncRequest('POST', file,
		{
			success: function(o)
			{
				var content = YAHOO.lang.JSON.parse(o.responseText);

				for (i in content)
					if (i != null)
					{
						Dom.get(id).innerHTML += 
						'<option value="' + content[i].id + '">[' + content[i].id + '] ' + content[i].name + '</option>';
					}
			},
			failure: function(o)
			{
				alert(o.statusText);
			}
		},'project=' + project);
	};

	// Ajoute un bouton.
	this.addButton = function(label, id, icon, callback)
	{
	    var button = new YAHOO.widget.Button(
	    {
	    	id: id, 
	        type: "button", 
	        label: label, 
	        container: this.name + 'Footer' 
	    });
		button.addClass(icon);
		button.on('click', callback);
	};
	
	// Champ caché permettant de passer une valeur...
	this.setParam = function(field, value)
	{
		this.params[field] = value;
	};
	
	// Change l'état d'un champ donné.
	this.switchControl = function(id, content){
		if(Dom.get(id + 'Label')){
			Dom.get(id + 'Label').innerHTML = content;
		}
		if(Dom.get(id + 'Row')){
			Dom.get(id + 'Row').className = (content && content.length > 0) ? 'visibleRow' : 'hiddenRow';
		}
	};
}

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbLink.js ****/
var mbLink_id = 0;
var mbLink_oldHash = null;
var mbLink_waitProject = false;

var mbLink_project = 0;
var mbLink_menu = null;
var mbLink_case = -1;
var mbLink_page = null;
var mbLink_id = 0;
var mbLink_tab = 0;

function mbLink(link, field, attribute, description){
	this.attribute = 	attribute ? attribute : 'value';
	if((typeof field) == 'object'){
		this.field = field;
	}else{
		this.field = Dom.get(field);
	}
	this.description = 	description ? description : 'Voir les détails';			// Popup de description au-dessus du lien.
	
	if (this.field)
	{
		this.id = ++mbLink_id;
		
		// On splite la chaîne en différents éléments.
		var components = link.split('.');
		mbLink_menu = components[0];
		mbLink_page = components[1];

		// Ajoute l'image clicable servant de lien.
		var img = document.createElement('img');
		img.setAttribute('id', 'link_' + this.id);
		img.setAttribute('src', WWW_STATIC + 'images/icons/link_go.png');
		img.setAttribute('title', this.description);
		img.className = 'mbLink';
		this.field.parentNode.appendChild(img);
			
		Event.addListener('link_' + this.id, 'click', function()
		{
			mbLink_id = this.field[this.attribute];
			mbMenu_buttons[mbLink_menu].load(mbLink_case, mbLink_page, mbLink_id);
		},
		this,
		true);
	}
	else
	{
		alert('Le champ de liaison n\'existe pas.');
	}
}

function goToPage(extern, section, page, id, tab){
	if(extern){
		window.open(location.href.replace(/#.*/, "") + '#' + project + ':' + section + '.' + page + '.' + id + (tab?'(' + tab + ')':''));
	}else{
		location.href = "#" + project + ":" + section + "." + page + "." + id + (tab?'(' + tab + ')':'');
	}
}

function mbLink_update(){
	// Si on a un projet de dispo.
	if (mbLink_project){
		var hash =	'#' + mbLink_project;
	
		// Si on a un menu.
		if (mbLink_menu && mbMenu_buttons[mbLink_menu]){
			hash += ':' + mbLink_menu;
			
			// Si une case est définie.
			if (mbLink_case >= 0){
				hash += '[' + mbLink_case + ']';
			}
			
			// Si on a une page.
			if (mbLink_page && mbMenu_buttons[mbLink_menu].pages[mbLink_page]){
				hash += '.' + mbLink_page;
				
				// Si on a un id.
				if (mbLink_id){
					hash += '.' + mbLink_id;
				}
			}
			
			if(mbLink_tab){
				hash += '(' + mbLink_tab + ')';
			}
		}
		location.href = hash;
	}
	
	mbLink_oldHash = location.hash;
}

function mbLink_hash(){	
	// Si le hash est différent de l'ancien enregistrement, on analyse.
	if (mbLink_oldHash != location.hash){
		// Enregistrement du nouveau hash.
		mbLink_oldHash = location.hash;
		
		// Charge le menu, la page, l'item...
		function loadPage(link){
			// Si on a des données de menu.
			if (link){
				
				
				// Si on a des crochets : menu split.
				var startIndex = link.indexOf('[');
				var endIndex = link.indexOf(']');
				if (startIndex >= 0 && endIndex > startIndex){					
					mbLink_case = link.substring(startIndex + 1, endIndex);
					link = link.replace(/\[.*\]/, '');
				}

				startIndex = link.indexOf('(');
				endIndex = link.indexOf(')');
				if (startIndex >= 0 && endIndex > startIndex){					
					mbLink_tab = link.substring(startIndex + 1, endIndex);
					link = link.replace(/\(.*\)/, '');
				}else{
					mbLink_tab = 0;
				}
				
				var components = link.split('.');

				mbLink_menu = 	components[0];
				mbLink_page = 	components[1];
				mbLink_id =		components[2];
				
				
				// Si on a bien un lien de menu défini.
				if (mbLink_menu){
					if (mbMenu_buttons[mbLink_menu]){
						mbMenu_buttons[mbLink_menu].load(mbLink_case, mbLink_page, mbLink_id, mbLink_tab);
					}else{
						alert('Le menu "' + mbLink_menu + '" n\'existe pas.');
					}
				}
			}
		}
		// On coupe le hash de l'url.
		// Format => projet:menu.page.id
		var temp = location.hash.substring(1).split(':');

		// Si on n'a pas de projet, ou que celui-ci est nul, on sélectionne manuellement un projet.
		if (!temp[0])
		{
			mbLink_project = 0;
			
			if (!mbLink_waitProject)
			{
				mbLink_waitProject = true;
				createProjectPanel();
			}
		}
		else if (project != temp[0]) // Dans le cas contraire : on récupère les infos du projet, et on loade.
		{
			mbLink_project = temp[0];
			
			Connect.asyncRequest('post','ajax/project/getProjects.php',
			{
				success: function(o){
					var projectData = YAHOO.lang.JSON.parse(o.responseText).data[0];
					setProject(mbLink_project,projectData.name);
					loadPage(temp[1]);
				},
				failure: function(o)
				{
					alert(o.responseText);
				}
			},'id=' + temp[0]);
		}
		else if (project == temp[0])
		{
			loadPage(temp[1]);
		}
	}

	setTimeout(mbLink_hash, 500);
}

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbMap.js ****/
(function(MetaBot, $, undefined){

MetaBot.Map = function(container, config, id){
	this.id = id;
	this.container = $("#" + container);
	this.container.addClass("map-container well");
	this.config = config;
	
	this.map = $("<div>");
	if(this.config.width){
		this.map.width(this.config.width);
		this.map.css("overflow-x", "hidden");
	}else{
		this.map.css("min-width", "512px");
	}
	if(this.config.height){
		this.map.height(this.config.height);
		this.map.css("overflow-y", "hidden");
	}else{
		this.map.css("min-height", "512px");
	}
	if(this.config.background){
		this.map.css("background", this.config.background);
	}
	this.container.append(this.map);
	this.map.addClass("map no-select");
	this.needSave = false;
	this.scale = 1;
};
MetaBot.Map.prototype.setScale = function(value){
	this.scale = value;
	this.map.css('-webkit-transform', 'scale(' + this.scale + ')');
	this.map.css('-moz-transform', 'scale(' + this.scale + ')');
	this.map.css('transform', 'scale(' + this.scale + ')');
};
MetaBot.Map.prototype.save = function(callback){
	var _this = this;
	Connect.asyncRequest('POST', 'api.php', {
		success: function(o){
			alert(o.responseText);
			_this.needSave = false;
			if(callback){
				callback();
			}
		}
	}, 'mbAction=SAVE_MAP&mbClass=' + this.id + '&positionData=' + encodeURIComponent(JSON.stringify(this.positionList)) + '&linkData=' + encodeURIComponent(JSON.stringify(this.linkList)) + '&deleteLinkData=' + encodeURIComponent(JSON.stringify(this.deleteLinkList)));
};
MetaBot.Map.prototype.isNeedingSave = function(){
	return this.needSave;
};
MetaBot.Map.prototype.update = function(data){
	var _this = this;
	this.needSave = false;
	this.currentData = data;
	this.map.empty();
	this.grid = false;
	if(this.config.gridMode){
		this.grid = $('<div>');
		this.grid.addClass('grid');
		this.grid.css('background', 'url(api.php?mbAction=IMG_GRID&sizeX=' + this.config.gridElmSize + '&sizeY=' + this.config.gridElmSize + ') left top');
		this.map.append(this.grid);
	}
	this.linkList = {};
	this.deleteLinkList = {};
	this.positionList = {};
	this.elmList = [];
	this.pointList = {};
	this.lastElm = false;
	
	// Enregistrement des points
	for(var i = 0; i < this.currentData.length; i++){
		var d = this.currentData[i];
		this.pointList[d.id] = d;
	}

	// Dessin des points
	for(var i = 0; i < this.currentData.length; i++){
		var elm = $("<div>");
		var d = this.currentData[i];
		if(!d.linkElmList){
			d.linkElmList = {};
		}
		if(d.linkList){
			for(var j = 0; j < d.linkList.length; j++){
				this.addLink(d, this.pointList[d.linkList[j]]);
			}
		}
		
		if(this.config.gridMode){
			elm.css("left", d.x * this.config.gridElmSize);
			elm.css("top", d.y * this.config.gridElmSize);
			elm.width(d.width * this.config.gridElmSize);
			elm.height(d.height * this.config.gridElmSize);
		}else{
			elm.css("left", d.x);
			elm.css("top", d.y);
			elm.width(d.width);
			elm.height(d.height);
		}
		if(this.config.centerElement){
			elm.css("margin-left", Math.round(-elm.width() / 2) + "px");
			elm.css("margin-top", Math.round(-elm.height() / 2) + "px");
		}
		d.elm = elm;
		elm.css("background", d.background);
		elm.css("position", "absolute");
		elm.data("id", d.id);
		elm.data("data", d);
		elm.addClass("map-elm");
		var label = $("<div>");
		label.addClass("map-elm-label");
		var name = "[" + d.id + "]";
		if(d.name){
			name += " " + d.name;
		}else if(d.name_lc){
			name += " " + d.name_lc;
		}
		label.html(name);
		elm.append(label);
		elm.on("click", function(){
			if(_this.linkMode){
				$(this).addClass("link-path");
				
				if(_this.lastElm){
					_this.addLink(_this.lastElm.data("data"), $(this).data("data")).trigger("refresh");
				}
				_this.lastElm = $(this);
			}
		});
		elm.draggable({
			start: function(event, ui) {
		        ui.position.left = 0;
		        ui.position.top = 0;
		        if(_this.linkMode){
		        	return false;
		        }
		    },
		    drag: function(event, ui) {
		    	if(_this.scale != 1){
			        var changeLeft = ui.position.left - ui.originalPosition.left; // find change in left
			        var newLeft = ui.originalPosition.left + changeLeft / (( _this.scale)); // adjust new left by our zoomScale
	
			        var changeTop = ui.position.top - ui.originalPosition.top; // find change in top
			        var newTop = ui.originalPosition.top + changeTop / _this.scale; // adjust new top by our zoomScale
	
			        ui.position.left = newLeft;
			        ui.position.top = newTop;
		    	}
		    	var linkElmList = ui.helper.data("data").linkElmList;
		    	for(var i in linkElmList){
		    		linkElmList[i].trigger("refresh");
		    	}
		    },
			stop: function(e, ui){
				var x = ui.position.left;
				var y = ui.position.top;
				if(_this.config.gridMode){
					x = Math.round(x / _this.config.gridElmSize);
					y = Math.round(y / _this.config.gridElmSize);
					ui.helper.css("left", x * _this.config.gridElmSize);
					ui.helper.css("top", y * _this.config.gridElmSize);
				}
				_this.refreshMapSize();
				_this.positionList[ui.helper.data('id')] = [x, y];
				_this.needSave = true;
			}
		});
		this.elmList.push(elm);
		this.map.append(elm);
	}
	

	// Dessin des liens
	for(var p in this.pointList){
		var d = this.pointList[p];
		if(d.linkList){
			for(var i = 0; i < d.linkList.length; i++){
				d.linkElmList[d.linkList[i]].trigger("refresh");
			}
		}
	}
	
	
	this.refreshMapSize();
	this.linkMode = false;
};
MetaBot.Map.prototype.addLink = function(from, to){
	this.needSave = true;
	var _this = this;
	if(from.id > to.id){
		var c = to;
		to = from;
		from = c;
	}
	var linkId = "link-" + from.id + "-" + to.id;
	var linkElm = $("#" + linkId);
	this.linkList[linkId] = [from.id, to.id];
	delete this.deleteLinkList[linkId];
	
	if(!linkElm.length){
		linkElm = $("<div>");
		linkElm.addClass("map-link");
		linkElm.attr("id", linkId);
		this.map.append(linkElm);
	
		if(!to.linkElmList){
			to.linkElmList = {};
		}
		to.linkElmList[from.id] = linkElm;
		from.linkElmList[to.id] = linkElm;
	
		linkElm.data("from", from);
		linkElm.data("to", to);
		linkElm.on("refresh", function(){
			var elm = $(this); 
			var x1 = parseInt(elm.data("from").elm.css("left").replace('px', ''));
			var y1 = parseInt(elm.data("from").elm.css("top").replace('px', ''));
			var x2 = parseInt(elm.data("to").elm.css("left").replace('px', ''));
			var y2 = parseInt(elm.data("to").elm.css("top").replace('px', ''));
			var length = Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
			elm.width(length);
			var angle = Math.atan2(y2 - y1, x2 - x1);
			elm.css("left", x1 + "px");
			elm.css("top", y1 + "px");
			elm.css("-webkit-transform", "rotate(" + angle + "rad)");
			elm.css("-moz-transform", "rotate(" + angle + "rad)");
			elm.css("transform", "rotate(" + angle + "rad)");
		});
		
		var delLinkElm = $("<div>");
		delLinkElm.addClass("btn btn-danger");
		delLinkElm.html("x");
		delLinkElm.data('link', linkElm);
		delLinkElm.on('click', function(){
			_this.deleteLink($(this).data('link'));
		});
		linkElm.append(delLinkElm);
	}
	return linkElm;
};
MetaBot.Map.prototype.deleteLink = function(linkElm){
	this.needSave = true;
	this.deleteLinkList[linkElm.attr("id")] = this.linkList[linkElm.attr("id")];
	delete this.linkList[linkElm.attr("id")];
	linkElm.remove();
};
MetaBot.Map.prototype.getLinkMode = function(){
	return this.linkMode;
};
MetaBot.Map.prototype.setLinkMode = function(b){
	this.linkMode = b;
	if(this.linkMode){
		this.map.addClass("link-mode");
	}else{
		this.map.removeClass("link-mode");
		this.lastElm = false;
		for(var i in this.pointList){
			this.pointList[i].elm.removeClass("link-path");
		}
	}
};
MetaBot.Map.prototype.refreshMapSize = function(){
	if(!this.config.width && !this.config.height){
		var width = 0;
		var height = 0;
		for(var i = 0; i < this.elmList.length; i++){
			var elm = this.elmList[i];
			var left = parseInt(elm.css("left").replace('px', ''));
			var top = parseInt(elm.css("top").replace('px', ''));
			var elmWidth = elm.width();
			var elmHeight = elm.height();
			if(left + elmWidth > width){
				width = left + elmWidth;
			}
			if(top + elmHeight > height){
				height = top + elmHeight;
			}
		}
		this.map.width(width);
		this.map.height(height); 
	}
};

})(window.MetaBot = window.MetaBot || {}, window.jQuery);

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbMenuButton.js ****/
// Classe utilisée pour la création d'un bouton de menu (latéral gauche).
// label -> titre du bouton.
// icon -> icône du bouton.
// container -> conteneur du bouton.
// onclick -> fonction appelée lors du clic sur un item.

var mbMenuButton = function(o, label, icon, container, onclick, param){
	var _this = this;
	if(typeof(o) == "object"){
		this.config = o;
		this.noProject = o.noProject;
		this.id = o.id;
		this.link = o.id;
		this.label = o.label;
		this.icon = o.icon;
		this.pageConfigList = o.pageConfigList;
		this.minAccessLevel = o.minAccessLevel;
		this.maxAccessLevel = o.maxAccessLevel;
		this.isDefault = o.isDefault;
		if(!this.noProject && !MetaBot.PROJECT_ID && MetaBot.PROJECT_FIELD_NAME){
			return;
		}
		for(var i = 0; i < this.pageConfigList.length; i++){
			this.pageConfigList[i].menu = this;
		}
		this.onclick = function(){
			_this.pageList = [];
			for(var i = 0; i < _this.pageConfigList.length; i++){
				var pageConfig = _this.pageConfigList[i];
				if(MetaBot.userAccessManager.hasAccess(pageConfig.minAccessLevel, pageConfig.maxAccessLevel, this.id, pageConfig.id)){
					_this.pageList.push(new mbPage(pageConfig));
				}
			}
			if(_this.pageList.length > 0){
				_this.selectPage(_this.pageList[0]);
			}
		};
	}else{
		this.link =			o;			// Nom du lien vers ce menu.
		this.id = 			o;
		this.type = 		'checkbox';
		this.icon =			icon;			// Icône utilisée par le menu.
		this.label = 		label;			// Titre du bouton.
		this.container =	container;		// Conteneur utilisé par le menu.
		this.onclick = 		onclick;		// Evènement appelé à l'onlick.
		this.param =		param;
	}
	
	this.addToMenuList();
};

//Héritage depuis mbMenu.
mbMenuButton.prototype = new mbMenu();

mbMenuButton.prototype.initButton = function($parent){
	var _this = this;
	
	// Création d'un bouton simple.
	this.button = $('<li><a href="#"><i class="icon-' + this.icon + '"></i> ' + this.label + ' <i class="icon-chevron-right pull-right"></i></a></li>');

	// Ajoute icône et gestion du switch on/off du bouton avec les autres boutons des menus.
//	this.button.addClass('silk-icon-' + this.icon);
	
	$parent.append(this.button);

//	this.button = new YAHOO.widget.Button({
//		label: this.label,
//		type: this.type,
//		checked: false,
//		container: this.container
//	});

	// Au clic sur le bouton...
	this.button.click(function(){
		_this.load();
	});
	if(this.isDefault){
		this.load();
	}
};
function loadCasinoPreview(){
	
}

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbMenuLayout.js ****/
(function(MetaBot, $, undefined){

MetaBot.MenuLayout = {
	$root: false,
	groupList: [],
	groupedButtonList: {},
	render: function(){
		this.$root = $('<div class="accordion" id="accordion-menu">');
		$('#menu-left').append(this.$root);

		var otherButtonList = [];
		for(var i in mbMenu_buttons){
			if(!this.groupedButtonList[i]){
				otherButtonList.push(i);
			}
		}
		if(otherButtonList.length > 0){
			this.addGroup({
				id: 'menu', 
				label: _2("menu"), 
				list: otherButtonList
			});
		}

		for(var i in this.groupList){
			var group = this.groupList[i];
			var ok = false;
			for(var j in group.menuIdList){
				var id = group.menuIdList[j];
				if(typeof(mbMenu_buttons[id]) == 'undefined'){
					console.log("[ERROR] Unknown menu button " + id);
				}else{
					ok = true;
					mbMenu_buttons[id].initButton(group.$container);
				}
			}
			if(ok){
				this.$root.append(group.$root);
			}
		}
	},
	addGroup: function(data){
		$groupContainer = $('<div class="nav nav-list">');
		$groupBody = $('<div class="accordion-body collapse '+ (this.groupList.length == 0?' in':'') + '" id="menu-body-' + data.id + '">').append($groupContainer);
		$group = $('<div class="accordion-group" id="menu-group-' + data.id + '">')
			.append('<h6 class="accordion-heading nav-header" data-toggle="collapse" data-parent="#accordion-menu" href="#menu-body-' + data.id +'">' + (data.icon?'<i class="icon-' + data.icon + '"></i> ':'') + data.label + '</h6>')
			.append($groupBody);
		
		for(var i in data.list){
			this.groupedButtonList[data.list[i]] = data.list[i];
		}
		this.groupList.push({
			$root: $group,
			$container: $groupContainer,
			menuIdList: data.list,
			config: data
		});
	}
};
	
})(window.MetaBot = window.MetaBot || {}, window.jQuery);

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbMenuList.js ****/
var mbMenuList_table = new Array();

// Classe utilisée pour la création d'un bouton de menu (latéral gauche).
// label -> titre du bouton.
// icon -> icône du bouton.
// container -> conteneur du bouton.
// table -> enumeration utilisée pour le sous-menu du bouton.
// onclick -> fonction appelée lors du clic sur un item.
function mbMenuList(link, label, icon, container, table, onclick, param)
{
	this.link =			link;			// Nom du lien vers le menu.
	this.type = 		'menu';			// Type du bouton à ajouter.
	this.label = 		label;			// Titre du bouton.
	this.icon =			icon;			// Icône utilisée par le menu.
	this.container =	container;		// Conteneur utilisé par le menu.
	this.onclick = 		onclick;		// Fonction appelée au clic sur un item du menu.
	this.table =		table;			// Table dans laquelle récupérer les différentes options du menu.
	this.param =		param;
		
	this.value = 		null;			// Valeur de l'item sélectionné. 
	this.text =			null;			// Texte de l'item sélectionné.
	
	this.list =			new Array();	// Tableau stockant les liens valeur/texte de la liste du menu. 

	// Création de la liste.
	this.createList = function(source)
	{
		var menu = new Array();
		
		// Ajoute à chaque item la fonction de callback au clic.
		for (var i = 0; i < source.length; i++)
		{
			this.list[source[i].value] = source[i].text;
			          
			menu[i] =
			{
				text: source[i].text,
				value: source[i].value,
				onclick: 
				{
					fn: function(p_sType, p_aArgs, p_oItem)
					{
						this.value = p_oItem.value;
						this.text = p_oItem.cfg.getProperty('text');
						this.load();
					},
					scope: this
				}
			};
		}
		
		// Création du bouton split.
		this.button = new YAHOO.widget.Button({
			label: this.label,
			type: 'split',
			menu: menu,
			checked: false,
			container: this.container
		});	
		
		this.addToMenuList();
	};
	
	// Fonction pour récupérer la valeur de l'item de de menu actuellement sélectionné.
	this.getValue = function()
	{
		return parseInt(this.value);
	};
	
	// On récupère le nom de l'élément de menu sélectionné.
	this.getText = function()
	{
		if (this.text)
		{
			return this.text;
		}

		return this.getValue();
	};
	
	if (typeof(mbMenuList_table[this.table]) == 'undefined')
	{
		mbMenuList_table[this.table] = {};
		mbMenuList_table[this.table].objects = new Array();
	}
	
	mbMenuList_table[this.table].objects.push(this);
}

// Héritage depuis mbMenu.
mbMenuList.prototype = new mbMenu();

// Une fois le DOM chargé (et donc les menus listes ajoutés), on charge tout :
/*Event.onDOMReady(function()
{
	for (var i in mbMenuList_table)
	{
		Connect.asyncRequest('POST', 'ajax/library/getEnum.php',
		{
			success: function(o)
			{
				var result = YAHOO.lang.JSON.parse(o.responseText);
								
				for (var j in mbMenuList_table[o.argument].objects)
				{
					mbMenuList_table[o.argument].objects[j].createList(result);
				}
			},
			failure: function(o) 
			{
				alert(o.responseText);
			},
			argument: i
		},'table=' + i);
	}
});*/

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbPage.js ****/
var mbPage_page = 0;
var mbPage_knownFields = [
 	'formTabs',
 	'loadStatusId',
 	'loadZoneId',
 	'allowCreation',
 	'allowDeletion',
 	'allowDuplication',
 	'allowMultipleAction',
 	'allowUpdate',
 	'allowZeroValue',
 	'beforeSubmit',
 	'booleanValue',
 	'fields',
 	'filters',
 	'firstAndLast',
 	'folder',
 	'form',
 	'formContainer',
 	'hasTree',
 	'treeParentFieldName',
 	'header',
 	'icon',
 	'id',
 	'idFieldName',
 	'link',
 	'menu',
 	'modifTable',
 	'newAssetLabel',
 	'onDataSelection',
 	'onTabChange',
 	'params',
 	'prefix',
 	'queries',
 	'recordContainer',
 	'recordContainerId',
 	'requestParam',
 	'rows',
 	'showTree',
 	'simpleData',
 	'source',
 	'template',
 	'label',
 	'title',
 	'customButtonList',
 	'customFormButtonList',
 	'tableName',
 	'width',
 	'height',
 	'minAccessLevel',
 	'maxAccessLevel',
 	'chart',
 	'map',
 	'protectDeletion',
 	'customContent',
 	'isDefault',
 	'disableSearch',
 	'currencyOptions'
];

/**
 * Crée une nouvelle page d'édition de données
 * 
 * Paramètres de configuration (valeur par défaut entre parenthèses si existante) :
 *  - id : identifiant (généré)
 *  - label : titre (obligatoire)
 *  - rows : Nombre de lignes du tableau (10)
 *  - header : Nom du champ de données récupéré en ajax (data)
 *  - folder : Nom du dossier où se situent les fichiers templates/{folder}/ et ajax/{folder}/ (obligatoire si pas de source)
 *  - prefix : Préfixe des fichiers utilisés situés dans les dossiers suscités (asset)
 *  	=> Les fichiers utilisés sont :
 *  		- templates/{folder}/{prefix}.tpl : template du formulaire d'édition
 *  		- ajax/{folder}/get{Prefix}s.php (majuscule automatique) : fichier ajax qui retourne la liste des fields demandés en json
 *  		- ajax/{folder}/add{Prefix}.php (majuscule automatique) : fichier ajax pour l'ajout et la mise à jour de l'enregistrement, données du formulaire envoyées en POST
 *  		- ajax/{folder}/del{Prefix}.php (majuscule automatique) : fichier ajax pour la suppression d'un enregistrement
 *  - source : Chemin du fichier de récupération des enregistrements (obligatoire si pas de folder)
 *  - fields : Liste des champs ([{name:"id",label:"Id"},{name:"name",label:"Nom"}])
 *  	=> Pour chaque field on a le choix entre mettre juste nom auquel cas la donnée sera enregistrée mais pas affichée, 
 *  		ou spécifier les paramètres sous forme d'objet, dont voici la liste :
 *  		- name : nom du champ tel que récupéré en json (obligatoire)
 *  		- label : Titre de la colonne (crée automatiquement une colonne s'il n'y a pas de paramètre noColumn)
 *  		- noColumn : Ne crée pas de colonne même si un label a été spécifié
 *  		- formatter : fonction ou id d'un formatter YUI
 *  		- forCreation : Ajoute un champ associé dans la boîte de dialogue de création (champ texte, ou liste si table est spécifié)
 *  		- nullable : indique qu'un champ requis pour la création est optionnel (la création peut donc se faire sans que ce champ soit rempli!)
 *  		- table : Nom de la table où récupérer les éléments si le champ est nécessaire à la création (crée une liste), le champ project est automatiquement pris en compte si existant
 *  - filters : Liste des filtres agissants sur le datatable de la page
 *  	=> pour chaque filtre on a le choix de renseigner plusieurs informations
 *  		- label (obligatoire) : nom tel qu'il est affiché sur le bouton de filtre 
 *  		- field (obligatoire) : nom du champ de la datatable sur lequel le filtre agit (il faut donc modifier le fichier ajax/{folder}/get{Prefix}s.php en conséquence)
 *  		- id ("filter" + field) : id du bouton de filtre
 *  		- icon : nom de l'icône à placer dans le bouton du filtre
 *  		- table (obligatoire) : table dans laquelle récupérer les éléments constituants le filtre
 *  		- hasParents : permet d'implémenter un menu déroulant avec les relations de parentée de la table utilisée pour le filtre
 *  		- relatedColumn (obligatoire si hasParents est à true) : champ de la table utilisé par le filtre pour implémenter les relations de parentée
 *  		- where : complément pour la requête sur la table 
 *  		- sortByLetter : permet de trier les résultats par groupe de lettres (a-d, e-h, i-l, m-p, q-t, u-z)
 *  		- minHeight (90px) : hauteur minimum du menu du filtre une fois déroulé
 *  		- maxHeight (topPanel.getStyle('height') - 120px) : hauteur maximum du menu du filtre une fois déroulé
 *  
 *  	=> on peut également utiliser des paramètres entièrement personalisés pour les filtres
 *  		- customFilter : booléen qui indique que le filtre à construire est personalisable
 *  		- field (obligatoire) : utilisé uniquement pour indexer les valeurs du filtre
 *  		- customFields (obligatoire) : valeurs du filtre de type customFields: [{text: 'Nom du filtre à afficher', value: 'monparam1=mavaleur1&monparam2=mavaleur2'}, etc.]
 *  		- icon : nom de l'icône à placer dans le bouton du filtre
 *  
 *  	=> on peut également créer un filtre de type booléen (checkbox YUI)
 *  		- booleanFilter : booléen qui indique que le filtre à construire est de type booléen
 *  		- field (obligatoire) : champ ciblé par le booléen
 *  		- icon : nom de l'icône à placer dans le bouton du filtre
 *  
 *  	=> on peut également implémenter une instance unique d'un bouton d'action multiple qui permet d'effectuer une action sur l'ensemble des éléments de la datatable qui ont été sélectionnés
 *  		- allowMultipleAction : regroupe le type d'action dans l'unique bouton d'action multiple (tous les filtres comportant cette information seront regroupés dans un seul et même bouton)
 *  		- allowZeroValue : autorise l'utilisateur à définir une valeur 0 pour le type d'action sélectionné
 *  		- modifTable (obligatoire) : table cible de la modification
 *  		- label (obligatoire) : le label est le nom de l'action à effectuer, il apparait sous la forme "modifier {label}s"
 *  		- field (obligatoire) : champ modifié par l'action (int)
 *  		- idFieldName ('id') : nom du champ qui sert à la modification (par défaut c'est le champ ID de la table) 
 *  		** soit on utilise plusieurs valeurs en prenant la data d'une table (AJAX appelé : ajax/setFieldValue.php)
 *  		- table : table dans laquelle récupérer les éléments constituants les choix possibles pour la modification
 *  		- where : complément de reqûete sur la table renseignée
 *  		- hasParents : permet d'implémenter le choix de modification avec les relations de parentée de la table utilisée
 *  		- relatedColumn (obligatoire si hasParent est à true) : champ de la table utilisée pour implémenter les relations de parentée
 *  		** soit on utilise une valeur fixe (pour un booléen par exemple) (AJAX appelé : ajax/setBooleanValue.php)
 *  		- booleanValue : à la base on l'utilise pour y mettre un 1 ou un 0.. rien n'empêche de mettre une autre valeur fixée (int)
 *  		** soit on utilise un fichier pour faire un traitement spécifique
 *  		- modifFile : permet de définir un fichier (sans .php) présent dans le 'folder' pour réaliser un traitement spécifique (ex: template)
 *  		- modifArgs : paramètres nécessaire pour le traitement du fichier 'modifFile' (syntaxe: 'monParam1=valeur1&monParam2=valeur2') 
 *  		
 *  - queries : Liste des données de tables supplémentaires à récupérer, le champ project est automatiquement pris en compte si existant
 *  - disableCreation : Désactive la possibilité d'ajouter de nouveaux enregistrements et d'en supprimer
 *  - tabView : Objet tabView où ajouter la page (variable globale tabView)
 *  - recordContainerId : Id du container où afficher la liste des enregistrements (data)
 *  - formContainerId : Id du container où afficher le formulaire d'édition (layout2.getUnitByPosition("bottom").body)
 *  - newAssetLabel : titre du bouton d'ajout de nouvel enregistrement (Nouveau)
 *  - onDataSelection : fonction à appeler une fois les données chargées
 *  - requestParam : paramètre de requête (envoyé pour le get et le post)
 *  - allowDuplication : ajoute un bouton de duplication
 *  - beforeSubmit : fonction appelée avant l'envoi des données (s'il y a certaines données à formater...)
 *  - simpleData : page sans tableau de données, juste un formulaire.
 *  - treeParentFieldName : nom du champ pour ordonner en arbre
 *  - firstAndLast : ajoute un lien "first" et "last" pages au niveau du dataTable (à la place de "previous" et "next" pages)
 *  
 *  Note : dans le formulaire (.tpl), les données de l'enregistrement sont accessible via la variable {$formVars.fieldName}
 *  et les données supplémentaires de queries via la variable {$formVars.tableName}. Pour lier des données plus complexe qu'une simple table, 
 *  il faut modifier le fichier ajax/getForm2.php pour ajouter la requête personnalisée
 *  
 * @param config Config, voir plus haut
 * @param id
 * @param rowsPerPage
 * @param dataSource
 * @param dataHeader
 * @param dataFields
 * @param dataQueries
 * @return
 */
function mbPage(config){
	/////////////////// PARAMETRES DE LA PAGE.
	var _this = this;
	
	this.config = config;
	this.page = 				++mbPage_page;											// On donne a la page un identifiant numérique unique : 1+.
	this.id = 					config.id ? config.id : config.prefix;
	this.pageId = 				this.id + '_' + mbPage_page;		// Identifiant string unique de la page.
	
	this.tableName =			(config.tableName?config.tableName:'G'+config.prefix);
	this.menu = 				config.menu;			// mbMenu(List ou Button) lié à la page courante.

	this.simpleData = 			config.simpleData;
	
	this.tabIndex =				0;
	
	this.onDataSelection =		config.onDataSelection;
	this.onTabChange =			config.onTabChange;
	
	this.locked =				false;					// Verrouille ou non l'envoi de requêtes (enregistrement & autres).
	
	this.customButtonList =		config.customButtonList ? config.customButtonList:[];
	this.customFormButtonList =		config.customFormButtonList ? config.customFormButtonList:[];
	
	/////////////////// CONFIGURATION VISUELLE ET REPRESENTATIVE.

	this.formTabs =				config.formTabs;
	this.label = 				config.label ? config.label : (config.title?config.title:'Page sans titre');
	this.icon = 				config.icon;									// Icône de l'onglet de la page.
	this.rows = 				config.rows ? config.rows : 10;					// Nombre de lignes de tableau par page de données.
	
	this.hasTree = 				config.hasTree;									// Vaut true si les données peuvant être affichés en arbre.
	if(config.treeParentFieldName){
		this.treeParentFieldName = config.treeParentFieldName;
	}else{
		this.treeParentFieldName = 'parent';
	}
	this.showTree =				config.showTree ? config.showTree : false;		// Affichage par défaut ou non de l'arbre si disponible.

	this.hasButtons = 			false;											// Vrai si la page a des boutons de partie haute.
	this.hasFilters = 			false;											// Idem pour les filtres.
	this.hasFirstAndLast =		config.firstAndLast ? config.firstAndLast : false;	// Affichage de liens "première page" et "dernière page" au niveau du dataTable
	
	/////////////////// PARAMETRES LIES AUX DONNEES.

	this.source = 				config.source;									// Fichier source des données.
	this.header = 				config.header ? config.header : 'data';	 		// En-tête du fichier PHP de récupération de données, pour le JSON.
	this.form =					config.form ? config.form : 'dataForm';			// Id du formulaire de données associé.
	
	this.dataSourceFields = 	[];
		
	this.template = 			config.template;								// Page du fichier .tpl contenant le formulaire.
	this.formFunction = 		null;											// Fonction de callback à appeler au chargement du formulaire.
	
	this.fields = 				config.fields ? config.fields : [{name:"id",label:"Id"},{name:"name",label:"Nom"}];
	this.queries = 				config.queries ? config.queries : [];			// Tables requises.
	this.filters =				config.filters ? config.filters : [];			// Filtres.	
	this.filtersValue =			{};									// Valeurs des différents filtres.
	
	this.multipleActionMenu = 	new Array();									// Différentes valeurs du menu d'action multiple utilisé pour les filtres
	this.multipleActionButton = null;											// Bouton réservé pour les actions multiples
	this.multipleActionParentCount = 0;											// Compteur qui sert à générer un id unique pour chaque sous-menu généré
		
	this.params = 				config.params ? config.params : [];				// Lignes par page de tableau.		
	this.requestParam =			config.requestParam ? config.requestParam : '';

	this.selectedId = 			(typeof(config.selectedId) != 'undefined' ? config.selectedId : 0);

	this.data = 				null;											// Données Record sélectionnées dans le tableau de la page.
	this.dataList = 			[];

	this.beforeSubmit =			config.beforeSubmit;

	this.loadStatusId =			(config.recordContainerId || config.loadStatusId)?config.loadStatusId:'loadStatus';
	this.loadZoneId =				(config.recordContainerId || config.loadZoneId)?config.loadZoneId:'loadZone';
	
	/////////////////// CONFIGURATION CREATION, MISE A JOUR, SUPPRESSION ITEMS. 

	// Autorise ou non la création de nouveaux éléments.
	this.allowCreation = 		(this.config.chart?false:((typeof(config.allowCreation) != 'undefined') ? config.allowCreation : true));
	
	this.allowUpdate = 			(typeof(config.allowUpdate) != 'undefined') ? config.allowUpdate : true;
	this.allowDeletion = 		(typeof(config.allowDeletion) != 'undefined') ? config.allowDeletion : true;
	this.allowDuplication = 	(typeof(config.allowDuplication) != 'undefined') ? config.allowDuplication : true;	
	if (this.simpleData){
		this.allowCreation = false;			// Données simple : pas de table, pas de création.
		this.allowDeletion = false;			// Données simple : pas de table, pas de suppression.
		this.allowDuplication = false;		// Données simple : pas de table, pas de duplication.
	}
	
	this.newAssetLabel = 		config.newAssetLabel ? config.newAssetLabel : _2("new");
	this.newFormList =			[];
	
	this.recordContainer = 		config.recordContainer ? config.recordContainer: (config.recordContainerId ? Dom.get(config.recordContainerId) : Dom.get('data'));
	
	/////////////////// COMPOSANTS YUI.
	
	this.dataTable =			null;					// Tableau.
	this.dataSource =			null;					// Source de données.
	this.paginator = 			null;					// Pagination du tableau.
	this.tree =					null;					// Vue en arbre.
	this.tabView =				null;					// Tabview lié à la page.
	this.tab =					null;					// Onglet de la page

	this.width = config.width;
	this.height = config.height;
	
	this.currencyOptions = config.currencyOptions?config.currencyOptions:{prefix: '', suffix: ' €', thousandsSeparator: ' ', decimalSeparator: ',', decimalPlaces: 2};
	
	/////////////////// MESSAGE D'ERREURS.
	
	var ERROR_BASE =			'Erreur : \n\n';
	
	var ERROR_UNKNOWN =			'Une erreur est survenue';
		
	var ERROR_NOPREFIX =		'[id] Aucun id n\'a été paramétré';

	var ERROR_FORMNOTFOUND =	'Impossible de récupérer le formulaire';
	var ERROR_FIELDNOTFOUND =	' : champ inconnu';
	
	var ERROR_ASYNCOP =			'Une opération est en cours, veuillez patienter';
	
	this.showError = function(message){
		message = ERROR_BASE + message + '\n\nDans [' + this.label + ']';
		alert(message);
	};

	
	/////////////////// MESSAGE D'INFO.
	
	var INFO_BASE = 			'';
	
	var INFO_ADD =				'Nouvel élément ajouté';
	
	var INFO_UPDATE =			'L\'élément a bien été mis à jour';
	var INFO_DELETE =			'L\'élément a bien été supprimé';
	var INFO_DUPLICATE =		'L\'élément a bien été dupliqué';
	
	var INFO_FILLFIELD =		'Veuillez remplir le champ : \n';
	
	this.showInfo = function(message){
		message = INFO_BASE + message;
		alert(message);
	};	
	

	this.unlockDataCount = 0;
	this.unlockDataTime = 0;
	
	/////////////////////////////////////////////////////////////////////
	/////////////////////// METHODES DE LA CLASSE ///////////////////////
	/////////////////////////////////////////////////////////////////////
	
	// Completion des fields
	this.linkEditorList = [];
	this.paintList = [];
	if(this.formTabs){
		this.formTabsExport = [];
		var fieldNameList = {};
		for(var i = 0; i < this.fields.length; i++){
			var f = this.fields[i];
			if((typeof f) == 'object'){
				fieldNameList[f.name] = true;
			}else{
				fieldNameList[f] = true;
			}
		}
		for(var i = 0; i < this.formTabs.length; i++){
			var formTab = $.extend(true, {}, this.formTabs[i]);
			this.formTabsExport[i] = formTab;
			var list = formTab.fields;
			if(list instanceof Array){
				for(var j = 0; j < list.length; j++){
					var currentFieldName = list[j];
					var dependance = false;
					if(typeof(currentFieldName) == "object"){
						dependance = currentFieldName.dependance;
						if(dependance && dependance[0] == '!'){
							dependance = dependance.substring(1);
						}
						if(currentFieldName.type == "thumb"){
							var list = [currentFieldName.xField, currentFieldName.yField, currentFieldName.widthField, currentFieldName.heightField];
							for(var k in list){
								if(!fieldNameList[list[k]]){
									fieldNameList[list[k]] = true;
									this.fields.push(list[k]);
								}
							}
						}
						currentFieldName = currentFieldName.name;
					}
					if(!fieldNameList[currentFieldName]){
						fieldNameList[currentFieldName] = true;
						this.fields.push(currentFieldName);
					}
					if(dependance && !fieldNameList[dependance]){
						fieldNameList[dependance] = true;
						this.fields.push(dependance);
					}
				}
			}else if(formTab.link){
				var linkContainerId = this.id + '-' + formTab.name + '-link';
				formTab.link.container = linkContainerId;
				formTab.link.label = formTab.label;
				if(!formTab.link.dataIdField){
					formTab.link.dataIdField = 'id';
				}
				var isInternal = false;
				if(!formTab.link.linkConfig){
					isInternal = true;
				}
				this.linkEditorList.push($.extend(true, {}, formTab.link));
				formTab.link = {
					fromType: formTab.link.fromType,
					toType: formTab.link.toType,
					tableName: formTab.link.tableName
				};
				if(isInternal){
					formTab.link.isInternal = true;
				}
				formTab.content = '<div id="' + linkContainerId + '"></div>'; 
			}else if(formTab.paint){
				var paintId = this.id + '-' + formTab.name + '-paint';
				fieldNameList[formTab.paint.name] = true;
				this.fields.push(formTab.paint.name);
				formTab.content = '<div id="' + paintId + '"></div>'; 
				formTab.paintConfig = formTab.paint;
				formTab.paint = new MetaBot.Paint(paintId, formTab.paintConfig);
				this.paintList.push($.extend(true, {}, formTab.paint));
			}
		}
	}
	
	
	// Ajoute un bouton dans la partie haute de la page.
	this.addTopButton = function(id, label, icon, onclick){
		var container = Dom.get(this.pageId + 'Buttons');
		
		var input = document.createElement('input');
		input.setAttribute('id', id);
		input.setAttribute('value', label);
		
		container.appendChild(input);
		
		return this.addButton(id,icon,onclick);
	};
	
	// Récupère l'id du contenu de la page.
	this.getPageId = function(){
		return this.pageId;
	};
	
	// Verrouille la page.
	this.lock = function(){
		if (!this.locked){			
			this.locked = true;

			var loader = document.createElement('span');
			loader.setAttribute('id', this.pageId + 'loader');
			loader.className = "loader-animation";
			Dom.get(this.loadStatusId).style.display = 'none';
			Dom.get(this.loadZoneId).appendChild(loader);
		}
	};
	
	// Déverrouille la page.
	this.unlock = function(count, time){
		if(typeof(time) != "undefined"){
			this.unlockDataCount = count;
			this.unlockDataTime = time;
		}
		if (this.locked){
			this.locked = false;

			var loader = Dom.get(this.pageId + 'loader'); 
			loader.parentNode.removeChild(loader);
		}
		var plural = this.unlockDataCount>1;
		if(plural){
			Dom.get(this.loadStatusId).innerHTML = _2("%1 results loaded in %2s").replace("%1", this.unlockDataCount).replace("%2", this.unlockDataTime.toFixed(2));
		}else{
			Dom.get(this.loadStatusId).innerHTML = _2("%1 result loaded in %2s").replace("%1", this.unlockDataCount).replace("%2", this.unlockDataTime.toFixed(2));
		}
		Dom.get(this.loadStatusId).style.display = 'block';
	};
	
	// Création de la zone contenant les boutons de la page (haut).
	this.createButtonsContainer = function(){
		if (!this.hasButtons){
			this.createFiltersContainer();
			
			this.hasButtons = true;
						
			var div = document.createElement('div');
			div.setAttribute('id', this.pageId + 'Buttons');
			div.className = 'pull-right';
			Dom.get(this.pageId + 'Filters').appendChild(div);
		}
	};
	
	// Création de la zone contenant les filtres de la page (haut).
	this.createFiltersContainer = function(){
		// Si on n'a pas encore de filtre, on ajoute la zone où ceux-ci seront ajoutés.
		if (!this.hasFilters){
			this.hasFilters = true;
			
			var div = document.createElement('div');
			div.setAttribute('id', this.pageId + 'Filters');
			div.className = "well well-small filters form-actions";
			div.style.position = 'relative';
			Dom.get(this.pageId + 'FiltersContainer').appendChild(div);	
		}
	};
	
	this.search = function(){
		if(this.searchTimeout){
			clearTimeout(this.searchTimeout);
		}
		this.searchTimeout = setTimeout(function(){
			_this.update();
		}, 500);
	};
	
	// Création d'un onglet.
	// id -> id unique à intégrer dans l'onglet.
	// label -> titre de l'onglet.
	// icon -> icône à ajouter au header de l'onglet.
	this.createTabContent = function(id){
		// On créé le contenu de la page.
		var panel = document.createElement('div');
		panel.setAttribute('id', id);
		
		// Zone d'accueil des filtres.
		var filter = document.createElement('div');
		filter.setAttribute('id', id + 'FiltersContainer');
		panel.appendChild(filter);
		
		var tablePanel = document.createElement('div');
		tablePanel.setAttribute("style", "position:relative");
		panel.appendChild(tablePanel);

		if(!this.loadStatusId){
			var loadStatusDiv = document.createElement("span");
			this.loadStatusId = id + "_loadStatus";
			loadStatusDiv.setAttribute('id', this.loadStatusId);
			loadStatusDiv.setAttribute('style', 'float:right');
			tablePanel.appendChild(loadStatusDiv);
		}
		
		if(!this.loadZoneId){
			var loadZoneDiv = document.createElement("span");
			this.loadZoneId = id + "_loadZone";
			loadZoneDiv.setAttribute('id', this.loadZoneId);
			loadZoneDiv.setAttribute('style', 'float:right');
			tablePanel.appendChild(loadZoneDiv);
		}
		
		if(!this.config.customContent && !this.config.disableSearch){
			// Zone de recherche
			var searchDiv = $(document.createElement("div")).addClass("input-prepend input-append page-search").attr("id", id + "Search");
			searchDiv.html('<label for="' + id + 'SearchInput" class="add-on"><i class="icon-search"></i></label>');
			var searchInput = $(document.createElement("input")).attr("type", "search").attr("id", id + "SearchInput").attr("placeholder", _2("search"));
			searchInput.keyup(function(e){
				_this.search(e);
			});
			searchDiv.append(searchInput);
			var refreshButton = $("<button>").attr("type", "button").addClass("btn").append('<i class="icon-refresh"></i>');
			refreshButton.click(function(){
				_this.update();
			});
			searchDiv.append(refreshButton);
			
			$(tablePanel).append(searchDiv);
		}
		
		// Zone centrale pour le tableau.
		var table = document.createElement('div');
		table.setAttribute('id', id + 'Table');
		table.className = 'data-table';
		tablePanel.appendChild(table);
				
		// Si on a un arbre.
		if (this.hasTree){
			var tree = document.createElement('div');
			tree.setAttribute('id', id + 'Tree');
			tree.style.overflow = 'auto';
			tree.style.backgroundColor = '#FFFFFF';
			tree.style.border = '1px solid #444444';
			tree.style.width = '100%';
			tree.style.marginTop = '5px';
			tree.style.marginBottom = '5px';
						
			panel.appendChild(tree);
		}
		
		_this.formContainer = Dom.get("form-container");
		return panel;
	};
	
	this.createTab = function(id, label, icon){
		
		// Zone de titre pour le tab.
		var header = '';
		
		// Ajoute l'icône si possible.
		if (icon){
			header += '<i class="icon-' + icon + '"></i> ';
		}
		header += label;
		
		var tab = new mbTab({
			label: header,
			content: this.createTabContent(id)
		});
		tab.onChange(function(){
			$(_this.formContainer).empty();
			_this.unlock();
		});
		
		return tab;
	};
	
	// Fonction de création d'arbre d'affichage pour les données.
    this.createTree = function(data){    	
    	// Création de l'arbre.    	    	
    	this.tree = new YAHOO.widget.TreeView(this.pageId + 'Tree');   	    	
    	
    	/** 
    	 * on a tout passé de TextNode à HTMLNode pour pouvoir set des valeurs à l'obj feuille (genre name + id)
    	 * ça permet de faire une sélection plus propre plutot que de parser comme un bourrin
    	 * et ça gèrera les [[ ]] de Sacha! true story.
    	 * 
    	 * voir talk.js
    	 */
    	
//    	var oTextNodeMap = {};
//
//	    function buildBranch(parentId, p_oNode, page)
//	    {
//	    	var oTextNode;
//	    	
//	        for (var i = 0; i < data.length; i++)
//	        {
//	        	var record = data[i];
//	        	if(record.getData(page.treeParentFieldName) == parentId)
//	        	{		        		
//	        		// TODO -> HTMLNode
//	        		oTextNode = new YAHOO.widget.TextNode(record.getData('name') + ' <font color="grey">[' + record.getData('id') + ']</font>', p_oNode, false);
//	        		oTextNodeMap[oTextNode.labelElId] = oTextNode;
//	        		buildBranch(record.getData('id'), oTextNode, page);
//	        	}
//	        }
//	    }
//
//    	var mainTextNode = new YAHOO.widget.TextNode(this.label + ' <font color="grey">[0]</font>', this.tree.getRoot(), false);
//   
//    	oTextNodeMap[mainTextNode.labelElId] = mainTextNode;
//    	buildBranch('0', mainTextNode, this);
    	
    	// on définit le noeud racine
    	var myTreeRootObj = {
    			type: 'html',
    			html: '<font color="grey">[0]</font> ' + this.label,
    			name: this.label,
    			dataid: 0
    	};
        var rootNode = new YAHOO.widget.HTMLNode(myTreeRootObj, this.tree.getRoot(), false);
        
        function buildBranch(parentNode, page){
        	//console.log('demandé pour ' + parentNode.data.dataid);
        	for(d in data){
        		//console.log('+-- id: ' + data[d].getData('id') + ' | name: ' + data[d].getData('name') + ' | id du père: ' + data[d].getData(page.treeParentFieldName));
        		if(data[d].getData(page.treeParentFieldName) == parentNode.data.dataid){
        			//console.log('#### trouvé !');        			
        			var myNodeObj = {
        	    			type: 'html',
        	    			html: '<font color="grey">[' + data[d].getData('id') + ']</font> ' + data[d].getData('name'),
        	    			name: data[d].getData('name'),
        	    			dataid: data[d].getData('id')
        	    	};
        	        var myNode = new YAHOO.widget.HTMLNode(myNodeObj, parentNode, false);
        			buildBranch(myNode, page);
        		}
        	}
        }
        
        // on construit l'arbre
        buildBranch(rootNode, this);
    	
		this.tree.subscribe('clickEvent', function(oArgs){ 
			var id = oArgs.node.data.dataid;

			var data = this.dataTable.getRecordSet();
	       	
	       	for (var i = 0; i < data.getLength(); i++){
	       		var record = data.getRecord(i);
	       		
	       		if (id == record.getData('id')){
		        	this.data = record;
		        	this.dataList = [record];
	       			if(this.tabView){
		    			this.loadDataForm(record);
	       			}else if(this.onDataSelection){
	    				this.onDataSelection(this.data, this.dataList);
	    			}
	    			break;
	       		}
	       	}	       		
		},
		this,
		true); 
    			
    	this.tree.expandAll();
    	this.tree.render();
//	    this.tree.draw();
	};
	
	// Affichage et masquage d'arbre.
	this.switchTree = function(tree){
		if (tree){
			this.showTree = true;
			
			this.switchButton.removeClass('icon_chart_organisation');
			this.switchButton.addClass('icon_application_view_columns');
			Dom.get(this.pageId + 'Table').style.display = 'none';
			Dom.get(this.pageId + 'Tree').style.display = 'block';
		}else{
			this.showTree = false;
			
			this.switchButton.removeClass('icon_application_view_columns');
			this.switchButton.addClass('icon_chart_organisation');
			Dom.get(this.pageId + 'Table').style.display = 'block';
			Dom.get(this.pageId + 'Tree').style.display = 'none';
		}
	};

	// Récupère l'index d'un enregistrement dans le set.
	this.getRecordIndex = function(){
		return this.dataTable.getRecordIndex(this.getRecord());
	};
	
	// Paramètre/créé un bouton.
	this.addButton = function(id, icon, onclick, config){
		var button = new YAHOO.widget.Button(id, config);
			
		// Ajoute une icône au bouton si on le peut.
		if (icon){
			button.addClass(icon);
		}

		// S'il y a une fonction de click définie.
		if (onclick){
			button.on('click', function(){
				// S'il n'y a pas de verrou.
				if (!this.locked){
					onclick.apply(this);
				}else{
					this.showError(ERROR_ASYNCOP);
				}
			},			 
			this,
			true);
		}
		
		return button;
	};
		
	// Ajoute le bouton de création d'un nouvel élément.
	this.addNewButton = function(id, file, param, label, dialogFields){
		if (!dialogFields){
			dialogFields = [];
		}
		
		var hasName = false;

		for (var i = 0; i < this.dataSourceFields.length; i++){
			if(this.dataSourceFields[i] == "name" && !this.fields[i].forCreation){
				hasName = true;
				break;
			}
		}
		
		if (hasName){
			dialogFields.unshift({
				name: 'name',
				label: 'Nom'
			});
		}

		// Création du conteneur de bouton du haut de l'écran.
		this.createButtonsContainer();
		
		// Création du dialogue de création de nouvel item.
		var dialog = Dom.get(id + '_newObjectDialog');
		if(dialog){
			dialog.innerHTML = '';
		}else{
			dialog = document.createElement('div');
		}
		dialog.id = id + '_newObjectDialog';
		
		// on indique si le champ à remplir est facultatif ou non
		for (var i = 0, max = dialogFields.length; i < max; i++){			
			if (dialogFields[i].nullable){
				dialogFields[i].label = dialogFields[i].label + ' (facultatif)';
			}
		}

		var header = document.createElement('div');
		header.setAttribute('class', 'hd');
		header.innerHTML = label;
		dialog.appendChild(header);
		
		var body = document.createElement('div');
		body.setAttribute('class', 'bd dialog');
		
		var form = document.createElement('form');
		form.setAttribute('method', 'POST');
		form.setAttribute("id", "newForm" + id);
		form.setAttribute('action', file + '?update=false&' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID);
		
		body.appendChild(form);
		dialog.appendChild(body);
		this.newFormList.push({"form": "newForm" + id,"fields":dialogFields, "dialogId":dialog.id});
		
		document.body.appendChild(dialog);
				
		// Define various event handlers for Dialog
		var handleSubmit = function(){
			for (var i = 0, max = dialogFields.length; i < max; i++){
				var field = dialogFields[i];				
				var value = Dom.get(dialog.id + '_' + field.name).value;
	
				// Si le champ ne peut pas être égal à 0.
				if (!field.nullable){
					if(!value || value == "0" || value == ""){
						_this.showInfo(INFO_FILLFIELD + field.label);
						return false;
					}
				}
			}
			
			dialogPanel.hide();
			Connect.setForm(form);
			Connect.asyncRequest('POST', file, {
				success: function(o){
					if (this.simpleData || !isNaN(parseInt(o.responseText))){
						this.showInfo(INFO_ADD);
						this.update();
					}else{
						this.showError(ERROR_UNKNOWN + "\n" + o.responseText);
					}
				},
				failure: function(o) {
					this.showError(o.responseText);
				},
				scope: _this
			}, MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + '&' + param);
		};
		
		var handleCancel = function(){
			dialogPanel.hide();
		};
		
		// Instantiate the Dialog
		var dialogPanel = new YAHOO.widget.Dialog(dialog.id, 
					{ width : "350px",
					  fixedcenter : true,
					  visible : false,
					  fixedcenter: true,
					  draggable: true,
					  modal: true,
					  hideaftersubmit:true,
					  constraintoviewport : true,
					  buttons : [ { text:"Submit", handler:handleSubmit, isDefault:true },
								  { text:"Cancel", handler:handleCancel } ]
					 } 
		);
		dialogPanel.render();
		
		// Création et ajout de l'input allant être utilisé.
		var button = $("<div>").addClass("btn btn-primary").attr("type", "button").attr("id", id).html('<i class="icon-plus-sign icon-white"></i> ' + label);
		button.click("click", function(){
			_this.loadDataForm(new YAHOO.widget.Record({id: "new", name: _2("new")}));
//			dialogPanel.show();
		});
		$("#" + this.pageId + 'Buttons').append(button);
		
	};
	
	// Ajoute le bouton de création d'un nouvel élément.
	this.addCustomButton = function(isFormButton, id, config){
		var container;
		if(isFormButton){
			container = $("#leftButtonDiv");
		}else{
			// Création du conteneur de bouton du haut de l'écran.
			this.createButtonsContainer();
			container = $("#" + this.pageId + 'Buttons');
		}
		// Création et ajout de l'input allant être utilisé.
		var button = $("<span>").addClass("btn").attr("type", "button").attr("id", id);
		if(config.uploadId){
			button.addClass("btn-upload");
			if(!config.icon){
				config.icon = 'upload';
			}
		}
        if (config.extraClass) {
            button.addClass(config.extraClass);
        }
		if(config.icon){
			button.append('<i class="icon-' + config.icon + '"></i> ');
		}
		button.append(config.label);
		
		if(config.icon){
			button.addClass(config.icon);
		}
		container.append(button);
		
		var _this = this;
		if(config.uploadId){
			var input = $("<input>").attr("type", "file").attr("name", config.uploadId);
			button.append(input);

			input.fileupload({
				url: "api.php",
				add: function(e, data){
					data.formData = {
						mbAction: 'UPLOAD',
						mbClass: _this.id,
						uploadId: config.uploadId,
						id: mbLink_id
					};
					data.formData[MetaBot.PROJECT_FIELD_NAME] = MetaBot.PROJECT_ID;
					
					if(config.customFields){
						$("#modal-label").html(config.label);
						$("#modal-body").html('<form class="form-horizontal" id="modal-editor-form"></form>');
						$('#modal').unbind('hide');
						$('#modal').unbind('show');
						$('#modal').unbind('hidden');
						$('#modal-close').unbind('click');
						$("#modal-close").html('Ok');
						$('#modal-action').unbind('click');
						$("#modal-action").html('Annuler');
						$("#modal-action").on('click', function(){
							$("#modal").modal('hide');
						});
						$('#modal-close').on('click', function(){
							var customData = {};
							for(var i = 0; i < config.customFields.length; i++){
								var field = config.customFields[i];
								if(!field.noEdit && Dom.get("linkEditor-" + field.name)){
									if(field.type == 'checkbox'){
										if(Dom.get("linkEditor-" + field.name).checked){
											customData[field.name] = 1;
										}else{
											customData[field.name] = 0;
										}
									}else{
										customData[field.name] = Dom.get("linkEditor-" + field.name).value;
									}
								}
							}
							data.formData.customData = JSON.stringify(customData);
							data.submit();
						});
						$('#modal').on('show', function(){
							var formFields = [];
							for(var i = 0; i < config.customFields.length; i++){
								var field = config.customFields[i];
								if(!field.noEdit){
									var newField = {};
									for(var j in field){
										newField[j] = field[j];
									}
									newField.name = "linkEditor-" + newField.name;
									formFields.push(newField);
								}
							}
							Connect.asyncRequest('POST', 'api.php', {
								success: function(o){
									$("#modal-editor-form").html(o.responseText);
								},
								failure: function(o){
									alert(o.statusText);
								}
							}, 'mbAction=FORM&isModal=1&formTabs=' + encodeURIComponent(JSON.stringify(formFields)) + '&' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID);
						});
						$("#modal").modal({show: true, backdrop: "static"});
					}else{
						data.submit();
					}
				},
		        done: function (e, data) {
		        	alert(data.result);
					if(config.onclick){
						config.onclick(_this);
					}
		        }
		    });
		}else if(config.processId){
			var url = "api.php?mbAction=PROCESS&mbClass=" + this.id + "&processId=" + config.processId + "&" + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + '&id=' + mbLink_id;
			button.click(function(){
				if(config.modal){
					onclick = function(){
						$("#modal-label").html(config.label);
						$('#modal-close').unbind('click');
						$("#modal-action").unbind('click');
						$("#modal-action").html('Actualiser').click(function(){
							window.frames["modal-frame"].window.location.reload();
						});
						$("#modal-close").html('Fermer');
						$("#modal-body").html('<iframe id="modal-frame" src="' + url + '&modal"></iframe>');
						$('#modal').unbind('hide');
						$('#modal').unbind('show');
						$('#modal').unbind('hidden');
						$('#modal').on('hide', function(){
							_this.update();
						});
						$("#modal").modal({show: true, backdrop: "static"});
					};
				}else if(config.external){
					onclick = function(){
						window.open(url + "&external");
					};
				}else{
					onclick = function(){
						$.ajax({
							url: url
						}).fail(function(result){
							alert(result);
						}).done(function(result){
							alert(result);
						}).always(function(){
							if(config.onclick){
								config.onclick(_this);
							}
						});
					};
				}
				if(config.customFields){
					$("#modal-label").html(config.label);
					$("#modal-body").html('<form class="form-horizontal" id="modal-editor-form"></form>');
					$('#modal').unbind('hide');
					$('#modal').unbind('show');
					$('#modal').unbind('hidden');
					$('#modal-close').unbind('click');
					$("#modal-close").html('Ok');
					$('#modal-action').unbind('click');
					$("#modal-action").html('Annuler');
					$("#modal-action").on('click', function(){
						$("#modal").modal('hide');
					});
					$('#modal-close').on('click', function(){
						var customData = {};
						for(var i = 0; i < config.customFields.length; i++){
							var field = config.customFields[i];
							if(!field.noEdit && Dom.get("linkEditor-" + field.name)){
								if(field.type == 'checkbox'){
									if(Dom.get("linkEditor-" + field.name).checked){
										customData[field.name] = 1;
									}else{
										customData[field.name] = 0;
									}
								}else if(field.type == 'select' && field.multiple){
									var list = Dom.get("linkEditor-" + field.name);
									var values = [];
									for(var j in list.options){
										if(list.options[j].selected){
											values.push(list.options[j].value);
										}
									}
									customData[field.name] = values.join(","); 
								}else{
									customData[field.name] = Dom.get("linkEditor-" + field.name).value;
								}
							}
						}
						url += '&customData=' + encodeURIComponent(JSON.stringify(customData));
						if(config.external){
							onclick();
						}else{
							$('#modal').on('hidden', onclick);
						}
					});
					$('#modal').on('show', function(){
						var formFields = [];
						for(var i = 0; i < config.customFields.length; i++){
							var field = config.customFields[i];
							if(!field.noEdit){
								var newField = {};
								for(var j in field){
									newField[j] = field[j];
								}
								newField.name = "linkEditor-" + newField.name;
								formFields.push(newField);
							}
						}
						Connect.asyncRequest('POST', 'api.php', {
							success: function(o){
								$("#modal-editor-form").html(o.responseText);
							},
							failure: function(o){
								alert(o.statusText);
							}
						}, 'mbAction=FORM&isModal=1&formTabs=' + encodeURIComponent(JSON.stringify(formFields)) + '&' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID);
					});
					$("#modal").modal({show: true, backdrop: "static"});
				}else{
					onclick();
				}
			});
		}else if(config.url){
			button.click(function(){
				window.open(config.url.replace('{id}', _this.data.getData('id')));
			});
		}else if(config.onclick){
			button.click(function(){
				config.onclick(_this);
			});
		}
	};
	
	// Retourne l'enrgistrement
	this.getRecord = function(){
		return this.data;
	};

	// Fonction de mise à jour des données du tableau.
	this.update = function(){
		this.startTime = getMilliTime();
		var request = MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + '&mbAction=GET&mbClass=' + this.id + (this.requestParam ? '&' + this.requestParam : '');
		
		// On ajoute tous les filtres.
		for (var i in this.filtersValue){
			// si on a sélectionné autre chose que le choix "Tous"
			if(this.filtersValue[i] != 0){
				request += '&' + i + '=' + this.filtersValue[i];
			}
		}
		
		var searchElm = Dom.get(this.pageId + "SearchInput");
		var search = false;
		if(searchElm){
			search = searchElm.value;
		}
		if(search){
			request += '&search=' + encodeURIComponent(search);
		}

		if(this.customContent){
			request += '&mbCustom=1';
			
			Connect.asyncRequest('POST', this.source,{
				success: function(o){
					try{
						Dom.get(this.pageId + "Table").innerHTML = YAHOO.lang.JSON.parse(o.responseText).data;
					}catch(e){
						console.log(e.message);
						alert(o.responseText);
					}
				},
				failure: function(o){
					this.showError(o.statusText);
				},
				scope: this
			}, request);
		}else if(this.map){
			if(this.map.isNeedingSave() && confirm("Enregistrer les modifications avant de mettre à jour ?")){
				this.map.save(function(){
					_this.update();
				});
				return;
			}else{
				Connect.asyncRequest('POST', this.source,{
					success: function(o){
						try{
							this.map.update(YAHOO.lang.JSON.parse(o.responseText).data);
						}catch(e){
							console.log(e.message);
							alert(o.responseText);
						}
					},
					failure: function(o){
						this.showError(o.statusText);
					},
					scope: this
				}, request);
			}
		}else if(this.chart){
			request += "&mbChartType=" + this.config.chart.type;
			Connect.asyncRequest('POST', this.source,{
				success: function(o){
					try{
						this.chart.update(YAHOO.lang.JSON.parse(o.responseText).data);
					}catch(e){
						console.log(e);
						alert(o.responseText);
					}
				},
				failure: function(o){
					this.showError(o.statusText);
				},
				scope: this
			}, request);
		}else if (!this.simpleData){
			this.lock();
			this.dataTable.showTableMessage("Loading...");
			this.dataTable.load({
			    request:'?' + request,
			    success : function(oRequest , oResponse , oPayload){
			    	var selectedRow =			this.dataTable.getSelectedRows();
			    	var selectedId = 			-1;
			    	var page = 					this.paginator.getCurrentPage();
			    	var currentElementNb = 		this.dataTable.getRecordSet().getLength();
	
			    	if (selectedRow.length > 0)
			    	{
			    		selectedId = this.dataTable.getRecord(selectedRow[0]).getData('id');
			    	}
			    					
			    	var sortedBy = this.dataTable.get('sortedBy');

			    	this.dataTable.onDataReturnInitializeTable(oRequest, oResponse , oPayload);
	
			    	this.paginator.set('totalRecords',  oResponse.results.length);
			    	this.paginator.setPage(1);
			    	
			    	if (sortedBy){
			    		this.dataTable.sortColumn(this.dataTable.getColumn(sortedBy.key), sortedBy.dir);
			    	}
	
			    	var newElementNb = this.dataTable.getRecordSet().getLength();
	
			    	if (newElementNb == currentElementNb + 1){
			    		var maxID = '0';
			    		var rowToSelect = '0';
			    		var pageToSelect = '1';
			    						
			    		for(i = 0; i < newElementNb; i++)
			    		{
			    			if (this.dataTable.getRecord(i).getData('id') > maxID)
			    			{
			    				maxID = this.dataTable.getRecord(i).getData('id');
			    				rowToSelect = i;
			    				pageToSelect = Math.floor(i / this.rows) + 1;
			    			}
			    		}
			    					
			    		this.dataTable.selectRow(rowToSelect);
			    		this.paginator.setPage(pageToSelect);
			    	}else{
			    		if(selectedId >= 0){ 
			    			for(i = 0; i < newElementNb; i++){
			    				if(this.dataTable.getRecord(i).getData('id') == selectedId){		  					
			    					this.paginator.setPage(Math.floor(i / this.rows) + 1);
			    					this.dataTable.selectRow(i);
			    					return;
			    				}
			    			}
			    			
			    			// Si on n'a pas encore pu configurer la page sélectionnée (élément supprimé par exemple), on le fait ici.
			    			if (page > this.paginator.getTotalPages()){
			    				this.paginator.setPage(page - 1);
			    			}else{
			    				if (page != 1){
			    					this.paginator.setPage(page);
			    				}
			    			}
			    		}
			    	}
			    },
			    failure : this.dataTable.onDataReturnInitializeTable, 
			    scope : this
			});
		}else{
			Connect.asyncRequest('POST', this.source,{
				success: function(o){
					this.data = YAHOO.lang.JSON.parse(o.responseText);
					this.data.getData = function(fieldName){
						return this[fieldName];
					};
					this.loadDataForm(this.data);
				},
				failure: function(o){
					this.showError(o.statusText);
				},
				scope: this
			}, request);
		}
	};
	this.refresh = this.update;
	
	this.selectRecord = function(id){
		this.dataTable.unselectAllRows();
    	var count = this.dataTable.getRecordSet().getLength();
		for(i = 0; i < count; i++){
			if(this.dataTable.getRecord(i).getData('id') == id){		  					
				this.paginator.setPage(Math.floor(i / this.rows) + 1);
				this.dataTable.selectRow(i);
				return;
			}
		}
	};
	
	// Redimensionnement vertical.
	this.setTableHeight = function(height){
		height -= 5;
		if (!this.simpleData && this.dataTable)
		{
			height -= (150 + (this.hasButtons ? 40 : 0) + (this.hasFilters ? 40 : 0));
			this.dataTable.set('height', height + 'px');
			
			if (this.hasTree)
			{
				Dom.get(this.pageId + 'Tree').style.height = (height + 82) + 'px';
			}
		}
	};
	
	// Redimensionnement horizontal.
	this.setTableWidth = function(width){
		if (!this.simpleData && this.dataTable){
			width -= 33;
//			this.dataTable.set('width', width + 'px');
		}

		if (this.hasTree){
			Dom.get(this.pageId + 'Tree').style.width = (width) + 'px';
		}
	};
		
	// Sélectionne une ligne du tableau de données.
	this.selectRow = function(rowId){
		if (!this.simpleData && this.dataTable){
			this.dataTable.selectRow(rowId);
		}
	};
	
	this.addRecoverButton = function(input){
		var recoverMenu = [
			{text:'Charger une précédente version', value:1, onclick:function(){alert('ok');}}
		];
		var button = this.addButton(input, 'icon_database_refresh', function(){
			//if(confirm('**** SYSTÈME DE RÉCUPÉRATION DE DONNÉES ****\n\nDate : ' + recoveryDate + '\n\nCharger d\'autres données ?')){
			if(confirm('**** SYSTÈME DE RÉCUPÉRATION DE DONNÉES ****\n\nDate : ' + recoveryDate + '\n\nConfirmer le remplacement des données ?')){
				Connect.asyncRequest('POST', 'ajax/recoverAsset.php', {
					success: function(o){
						alert(o.responseText);
						this.update();
					},
					failure: function(o){
						this.showError(o.statusText);
					},
					scope: this
				}, 'tableName=' + this.tableName + '&id=' + this.data.getData('id'));
			}
		}, {type:"split",menu:recoverMenu});
		button.getMenu().subscribe("show", function(){
			button.getMenu().cfg.setProperty('context', ['dataRecoverButton', 'tr', 'br']);
		});
	};
	
	this.addHelpButton = function(input){
		var _this = this;
		this.addButton(input, 'icon_help', function(){
			showHelpDialog(_this.label);
		});
	};
	
	// Duplication de l'item courant : on conserve les données du formulaire, mais on n'envoie pas d'ID,
	// le fichier PHP effectuera donc une insertion au lieu d'une mise à jour.
	this.addDuplicateButton = function(id, file, param){
		this.addButton(id,'icon_add', function()
		{
			var form = Dom.get(this.form); 
				
			if (form)
			{
				Connect.setForm(form);
				Connect.asyncRequest('POST', file,
				{
					success: function(o)
					{
						if (this.simpleData || !isNaN(parseInt(o.responseText)))
						{
							this.showInfo(INFO_DUPLICATE);
							this.update();
		
							this.data.setData('id',parseInt(o.responseText));	// Sélectionne le nouvel élément.
						}
						else
						{
							this.showError(o.responseText);
						}
					},
					failure: function(o)
					{
						this.showError(o.responseText);
					},
					scope: this
				}, 'duplicate=' + this.data.getData('id') + '&' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + '&' + param);
			}
			else
			{
				this.showError(INFO_FORMNOTFOUND);
			}
		});
	};
			
	// Ajoute un nouveau filtre à la page.
	this.addFilter = function(config){
		if(config == "chart-stack"){
			config = {field: "chart-stack", label: _2("stack"), booleanFilter: true};
		}else if(config == "chart-time-interval"){
			config = {field: 'chart-time-interval', label: _2("group-by"), customFilter: true, customFields: [{text: _2("minute"), value: 60}, {text: _2("hour"), value: 3600}, {text: _2("6 hours"), value: 3600}, {text: _2("day"), value: 3600 * 24}, {text: _2("week"), value: 3600 * 24 * 7}, {text: _2("month"), value: 3600*24*31}]};
		}else if(config.type == "year"){
			var now = new Date();
			var from = 1970;
			if(config.from == 'now'){
				from = now.getFullYear();
			}else if(config.from){
				from = config.from;
			}
			var to = 2038;
			if(config.to == 'now'){
				to = now.getFullYear();
			}else if(config.to){
				to = config.to;
			}

			var value = false;
			if(config.value){
				value = config.value;
			}
			if(!value){
				value = now.getFullYear(); 
			}

			if(!config.field){
				config.field = "year";
			}
			if(!config.label){
				config.label = _2("year");
			}
			config.type = "select";
			config.customFilter = true;
			config.customFields = [];
			var ok = true;
			for(var i = from; ok; i += (to > from?1:-1)){
				config.customFields.push({value: i, text: i});
				if(i == to){
					ok = false;
				}
			}
		}else if(config.type == "month"){
			var now = new Date();
			
			var value = false;
			if(config.value){
				value = config.value;
			}
			if(!value){
				value = parseInt(now.getMonth()) + 1; 
			}

			if(!config.field){
				config.field = "month";
			}
			if(!config.label){
				config.label = _2("month");
			}
			config.type = "select";
			config.customFilter = true;
			config.customFields = [];
			var monthList = [_2("janvier"), _2("février"), _2("mars"), _2("avril"), _2("mai"), _2("juin"), _2("juillet"), _2("août"), _2("septembre"), _2("octobre"), _2("novembre"), _2("décembre")];
			for(var i in monthList){
				config.customFields.push({value: parseInt(i) + 1, text: monthList[i]});
			}
		}
		this.createFiltersContainer();
		var allowMultipleAction = config.allowMultipleAction ? true : false;
		var booleanFilter = config.booleanFilter ? true : false;
		var customFilter = config.customFilter || config.booleanFilter || config.customFields ? true : false;
		var customFields = config.customFields ? config.customFields : '';
		var allowZeroValue = config.allowZeroValue ? '1' : '0';
		var modifTable = config.modifTable ? config.modifTable : '';
		var modifFile = config.modifFile ? config.modifFile : '';
		var modifArgs = config.modifArgs ? config.modifArgs : '';
		var modifFields = config.modifFields ? config.modifFields : false;
		var booleanValue = config.booleanValue ? config.booleanValue : '';
		var label =	config.label;
		var field = config.field;
		var id = config.id ? config.id : 'filter' + field;
		var idFieldName = config.idFieldName ? config.idFieldName : '';
		var table = config.table ? config.table : '';
		var where = config.where ? config.where : '';
		var iconClass = config.icon ? config.icon : 'tag';
		var hasProject = typeof(config.hasProject) != 'undefined' ? config.hasProject : true;
		var hasParents = config.hasParents ? '1' : '0';
		var sortByLetter = config.sortByLetter ? '1' : '0';
		var projectLinkTable = config.projectLinkTable?config.projectLinkTable:false;
		var projectLinkField = config.projectLinkField?config.projectLinkField:false;
		var projectField = config.projectField?config.projectField:false;
		var projectType = config.projectType?config.projectType:false;
		var onclick = config.onclick;
		
		// Ajoute le bouton.
		var btnGroup = $(document.createElement("div")).addClass("btn-group").attr('id', this.pageId + '_' + id);
		Dom.get(this.pageId + 'Filters').appendChild(btnGroup.get(0));
		
		if(config.type == "date"){
			var btn = $(document.createElement("div"));
			var inputId = this.pageId + '-filter-' + config.field;
			var input = $('<input type="date" id="' + inputId + '"/>').on("change", function(){
				_this.filtersValue[config.field] = input.val();
				_this.update();
			});
			if(config.value){
				input.attr("value", config.value);
				_this.filtersValue[config.field] = config.value;
			}
			btn.append($('<label for="' + inputId + '">' + config.label + '</label>'));
			btn.append(input);
			btnGroup.append(btn);
		}else if(booleanFilter){
			var btn = $(document.createElement("div"));
			btn.addClass("switch");
			btn.append('<input type="checkbox"/>');
			btnGroup.append(btn);
			if(!config.labelOn){
				config.labelOn = config.label;
			}
			btn.attr('data-on-label', config.labelOn);
			
			if(!config.labelOff){
				config.labelOff = "<s>" + config.label + "</s>";
			}
			btn.attr('data-off-label', config.labelOff);
			btn.bootstrapSwitch();
			btn.on('switch-change', function (e, data) {
				_this.filtersValue[config.field] = data.value?1:0;
				_this.update();
			});
		}else{
			var btn = $(document.createElement("a")).addClass("btn dropdown-toggle").attr("data-toggle", "dropdown").attr("href", "#");
			var labelElm = $(document.createElement("span"));
			var icon = $(document.createElement("i"));
			icon.addClass("icon-" + iconClass);
			btn.append(icon);
			btn.append(" ");
			btn.append(labelElm);
			labelElm.append(label);
			btn.append(" ");
			btn.append($(document.createElement("span")).addClass("caret"));
			btnGroup.append(btn);
			
			var menu = $(document.createElement('ul')).addClass("dropdown-menu");
			btnGroup.append(menu);
			
			// bouton d'actions multiples
			if(allowMultipleAction){
				icon.removeClass().addClass("icon-cog");
				labelElm.html('Pour la sélection');
				
				// si ce champ du bouton d'action multiple a besoin de data
				if(table){
					// on récupère la data qui fera office de choix pour la modification 
					// sans l'en-tête "TOUS"
					Connect.asyncRequest('post', 'api.php', {
						success: function(o){
							// fonction qui ajoute l'action spécifique à effectuer
							function addActionOnclick(items, scope){
								for (var i in items){
									items[i].onclick = {
										fn: function(p_sType, p_aArgs, p_oItem){
											// si on a au moins 1 élément de sélectionné
											if(this.dataTable.getSelectedRows().length > 0){
												// pour chaque ligne sélectionnée
												for(var i = 0; i < this.dataTable.getSelectedRows().length; i++){
													// on récupère sa data
													var row = this.dataTable.getRecord(this.dataTable.getSelectedRows()[i]);
													// plus précisément son Id
													var targetId = row.getData('id');
													
													// et on fait notre petite popote
													Connect.asyncRequest('post', 'ajax/setFieldValue.php',
													{
														success: function(o) { },
														failure: function(o)
														{
															alert('Erreur:\n' + o.reponseText);
														}												
													}, 'targetId=' + targetId + '&newValue=' + p_oItem.value + '&fieldName=' + field + '&tableName=' + modifTable + (idFieldName != '' ? '&idFieldName=' + idFieldName : ''));
												}
												// Mise à jour de la table.
												this.update();
											}
											else
											{
												alert('Vous devez au moins sélectionner un élément.');
											}										
										},
										scope: scope
									};
			
									// Si on a des sous-menus, on relance la fonction avec ceux-ci.
									if (items[i].submenu)
									{
										addActionOnclick(items[i].submenu.itemData, scope);
									}
								}
							}
							// liste des items (sous forme d'arbre si parentée demandée)
							var items = YAHOO.lang.JSON.parse(o.responseText);
							// on ajoute l'action au clic pour chacun des éléments contenu dans la liste des items
							addActionOnclick(items, this);
							// on constitue la liste des items telle qu'elle doit apparaitre
							// dans le menu d'action multiple
							newItem = 
							{
								text: 'Modifier ' + label + 's',
								value: 0,
								submenu: 
								{
									// ici il faut ABSOLUMENT un id unique
									// sinon on ne peut pas dérouler le menu
									id: 'multipleAction_submenu_' + ++this.multipleActionParentCount,
									// on ajoute au sous-menu la liste des items (résultat)
									itemdata: [ items ]
								}
							};
							// on ajoute notre "nouvelle" liste constituée à notre menu de bouton
							this.multipleActionMenu.push(newItem);
						},
						failure: function(o)
						{
							this.showError(o.responseText);
						},
						scope: this
					}, 'mbAction=FILTER&' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + '&noall=1' + (allowZeroValue == '1' ? '&zerovalue=1&zerofieldname=' + label : '') + '&hasProject=' + (hasProject ? '1' : '0') + '&hasParents=' + hasParents + '&table=' + table + (where ? '&where=' + where : '') + '&sortByLetter=' + sortByLetter);
				}
				// sinon si ce champ agit sur un entier/booléen (exemple: activer, ou changer un état)
				else{
					// on constitue le choix tel qu'il doit être dans le menu d'action multiple
					var li = $(document.createElement("li"));
					menu.append(li);
					
					var action = $(document.createElement("a")).attr("href", "#").attr("tabindex", "-1").html(label);
					li.append(action);
					li.click(function(){
						// si on a au moins 1 élément de sélectionné
						if(_this.dataTable.getSelectedRows().length > 0){
							// pour chaque ligne sélectionnée
							for(var i = 0; i < _this.dataTable.getSelectedRows().length; i++){
								// on récupère sa data
								var row = _this.dataTable.getRecord(_this.dataTable.getSelectedRows()[i]);
								// plus précisément son Id
								var targetId = row.getData('id');
								if(modifFields){
									for(var j = 0; j < modifFields.length; j++){
										if(modifArgs != '' || j > 0){
											modifArgs += '&';
										}
										modifArgs += encodeURIComponent(modifFields[j]) + '=' + encodeURIComponent(row.getData(modifFields[j])); 
									}
								}
								// si on doit faire un traitement classique de type booléen
								if(modifFile == ''){
									// et on fait notre petite popote
									Connect.asyncRequest('post', 'ajax/setBooleanValue.php', {
										success: function(o) {
											alert(o.responseText);
										},
										failure: function(o) {
											alert('Erreur:\n' + o.reponseText);
										}												
									}, MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + '&targetId=' + targetId + '&fieldName=' + field + '&tableName=' + modifTable + '&booleanValue=' + booleanValue + (idFieldName != '' ? '&idFieldName=' + idFieldName : ''));
								}
								// sinon, si on a besoin d'un traitement spécifique mais qui ne nécessite pas de data particulière
								else{
									Connect.asyncRequest('post', 'ajax/' + _this.folder + '/' + modifFile + '.php',{
										success: function(o){
											alert(o.responseText);
										},
										failure: function(o){
											alert('Erreur:\n' + o.statusText);
										}												
									}, MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + '&targetId=' + targetId + (modifArgs != '' ? '&' + modifArgs : ''));
								}
							}
							// Mise à jour de la table.
							_this.update();		
						}else{
							alert('Vous devez au moins sélectionner un élément.');
						}
					});
				}
			}
			// bouton de filtre "classique"
			else{
				
				// filtre custom
				// les valeurs doivent être précisées dans customFields {text, value}
				if(customFilter){
					var itemList = [{text: '<strong>Tous</strong>', value: 0}];
					for(var i = 0; i < customFields.length; i++){
						if(typeof(customFields[i]) != "object"){
							itemList.push({text: customFields[i], value: customFields[i]});
						}else{
							itemList.push(customFields[i]);
						}
					}
					this.createFilterMenu(field, btn, labelElm, label, menu, itemList, true, onclick, config.value);
				}
				// Filtre normal
				// alimenté par la base de données
				else{			
					// on récupère la data pour le contenu du filtre
					Connect.asyncRequest('GET', 'api.php?mbAction=FILTER&' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + '&hasProject=' + (hasProject ? '1' : '0') + '&hasParents=' + hasParents + '&table=' + table + (where ? '&where=' + where : '') + '&sortByLetter=' + sortByLetter + (projectLinkTable?'&projectLinkTable=' + projectLinkTable:'') + (projectLinkField?'&projectLinkField=' + projectLinkField:'') + (projectField?'&projectField=' + projectField:'') + (projectType?'&projectType=' + projectType:''), {
						success: function(o){			
							this.createFilterMenu(field, btn, labelElm, label, menu, YAHOO.lang.JSON.parse(o.responseText), false, onclick, config.value);
						},
						failure: function(o){
							this.showError(o.responseText);
						},
						scope: this
					});
				}
			}
		}
	};
	
	this.createFilterMenu = function(field, btn, labelElm, label, menu, itemList, isCustom, onclick, value){
		for(var i = 0; i < itemList.length; i++){
			var li = $(document.createElement("li"));
			menu.append(li);
			
			var action = $(document.createElement("a")).attr("href", "#").attr("tabindex", "-1").html(itemList[i].text);
			li.data("data", itemList[i]);
			li.append(action);
			var onElmClick = function(li, update){
				// Si a une sélection non nulle, on précise, sinon on affiche seulement le label.
				if(li.data("data").value != 0){
					btn.addClass("btn-info");
					labelElm.html('<b>' + label + '</b> [<i style="font-size:smaller">' + li.data("data").text + '</i>]');
				}else{
					btn.removeClass("btn-info");
					labelElm.html(label);
				}

				if(onclick){
					onclick(li.data("data").value);
				}else{
					// Conserve la valeur actuelle du champ. (dans notre cas, directement les paramètres de la requete)
					_this.filtersValue[field] = li.data("data").value;
						
					if(update){					
						_this.update();
					}
				}
			};

			li.click(function(){
				onElmClick($(this), true);
			});
			if(itemList[i].value == 0){
				menu.append($('<li class="divider"></li>'));
			}
			if(itemList[i].value == value){
				onElmClick(li, false);
			}
		}
	};

	// Chargement du formulaire de données.
	this.loadDataForm = function(data){
		var dataString = 	'';
		var queryString = 	'';
		var paramString = 	'';
		
		// On dresse la liste des champs à envoyer.
		var dataList = [];
		for (i = 0; i < this.dataSourceFields.length; i++){
			var fieldName = this.dataSourceFields[i];
			if(typeof(data.getData(fieldName)) != "undefined"){
				dataList.push(fieldName);
				dataList.push(data.getData(fieldName));
			}
		}
		dataString = JSON.stringify(dataList);

		// Si on a des paramètres à envoyer, on dresse la liste de ceux-ci.
		if (this.params.length > 0){
			for (i = 0; i < this.params.length; i++){
				var fieldName = this.params[i].name;
				var fieldValue = this.params[i].value;
				paramString += fieldName + "¤" + fieldValue + ((i != this.params.length - 1) ? "¤" : '');
			}
		}

		// Si on a des requêtes de listes.
		if (this.queries){
			for (i = 0; i < this.queries.length; i++){
				queryString += this.queries[i] + ((i != this.queries.length - 1) ? "¤" : '');
			}
		}

		// On envoi les données récupérées au formulaire.
		Connect.asyncRequest("POST", "api.php", {
			success: function(o){
				// Ajoute le formulaire (ou l'erreur) reçue à la zone body.
				if (this.simpleData){
					if(Dom.get(this.pageId + 'Table')){
						Dom.get(this.pageId + 'Table').innerHTML = o.responseText;
					}else{
						this.tab.set("content", o.responseText);
					}
				}else{
					this.formContainer.innerHTML = o.responseText;
				}
				
				// On check les formules s'il y en a
				var list = this.formContainer.getElementsByClassName("formula");
				for(var i = 0; i < list.length; i++){
					checkFormula(list[i].value, Dom.get("checkButton" + list[i].id));
				}
				
				// Appel la fonction de retour à la récupération d'un nouveau formulaire.
				if (this.formFunction != null){
					this.formFunction(data);
				}
			},
			failure: function(o){
				this.showError(o.responseText);
			},
			scope: this
		}, 'mbAction=FORM&mbClass=' + this.id + '&' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + (this.allowCreation?'&allowCreation=':'') + (this.allowUpdate?'&allowUpdate=':'') + (this.allowDeletion?'&allowDeletion=':'') + (this.allowDuplication?'&allowDuplication=':'') + '&type=modify&dataString=' + encodeURIComponent(dataString) + '&queryString=' + encodeURIComponent(queryString) + '&paramString=' + encodeURIComponent(paramString) + '&form=' + this.template + (this.formTabsExport?'&formTabs=' + encodeURIComponent(JSON.stringify(this.formTabsExport)):''));
	};

	/////////////////// CREATION EFFECTIVE DE LA PAGE.
	// - checke les paramètres de configuration envoyés.
	// - checke l'attachement entre le page et le conteneur.
	// - définition de la source.
	// - récupération tabView.
	// - création onglet.
	// - ajout à la tabView.
	// - création dataTable.
	// 		- création arbre.
	// - mise en place du sous-formulaire.
	// - ajout des filtres.
	// - redimensionnement.

	// On commence par checker tous les paramètres envoyés pour parer à toute erreur aussi pitoyable qu'une faute de frappe.
	for (var i in config){
		var known = false;
		
		for (var j in mbPage_knownFields){
			if (i == mbPage_knownFields[j]){
				known = true;
				break;
			}
		}
		
		if (!known){
			this.showError(i + ERROR_FIELDNOTFOUND);
		}
	}	
	
	// Message d'erreur si l'attachement à un élément HTML a foiré.
//	if (!this.formContainer){
//		this.showError(ERROR_NOCONTAINER);
//	}
	
	for (var i = 0; i < this.fields.length; i++){
		var fieldName = this.fields[i];
		
		if (typeof(fieldName) == "object"){
			fieldName = fieldName.name;
		}
		this.dataSourceFields.push(fieldName);
	}
	
	// Si on n'a pas de source explicite.
	if (!this.source){
		
		// Si on a un id
		if (this.id){
			// Configuration de données simple : pas de table.
			this.source = 'api.php';
		}else{
			this.showError(ERROR_NOPREFIX);
		}
	}
	
	// Si on a un menu de configuré (nécessaire !), on récupère le TabView de celui-ci.
	if (this.menu){
		this.menu.addPage(this);
		this.tabView = this.menu.getTabView();

		// S'il existe un lien de défini pour cette page (= intégrée au système de lien).
		if (this.link){
			// Si le lien de page courant correspond à la page courante.
			if (mbLink_page == this.link){
				this.selectedId = this.menu.getSelectedId();
			}
		}
	}
	
	this.displayPage = function(){
		// Mise à jour du lien.
		if(this.menu){
			if (mbLink_page != this.link){				
				mbLink_id = 0;
			}
			mbLink_page = this.link;	
			mbLink_update();
		}

		//if (this.getRecordIndex() == null)
		//{
		if(this.tabView){
			this.formContainer.innerHTML = '';
		}
		//}
		for(var fId = 0; fId < this.newFormList.length; fId++){
			var form = Dom.get(this.newFormList[fId].form);

			if(form.elements.length == 0)
			{
				form.innerHTML = "";
				
				var dialogFields = 	this.newFormList[fId].fields;
				var dialogId = 		this.newFormList[fId].dialogId;
				for (var i = 0, max = dialogFields.length; i < max; i++) 
				{
					var field = dialogFields[i];
				
					form.innerHTML += '<label for="' + dialogId + '_' + field.name + '">' + field.label + '</label>';
					
					if (field.table)
					{
						var select = document.createElement('select');
						select.setAttribute('id', dialogId + '_' + field.name);
						select.setAttribute('name', field.name);

						var option = document.createElement('option');
						option.value = 0;
						option.innerHTML = '---';
						select.appendChild(option);

						Connect.asyncRequest('get', 'ajax/getFilter.php?' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + '&table=' + field.table + '&hasProject=' + (field.noProject?'0':'1') + ((typeof(field.where) != 'undefined') ? '&where=' + field.where : ''),{
							success: function(o){
								var filterName = o.argument[0];
								var filterSelect = Dom.get(dialogId + '_' + filterName);
								var filterList = YAHOO.lang.JSON.parse(o.responseText);
								
								for (var j = 1, max = filterList.length; j < max; j++)
								{
									var option = document.createElement('option');
									option.value = filterList[j].value;
									option.innerHTML = filterList[j].text;
									filterSelect.appendChild(option);
								}
							},
							failure: function(o){ 
								this.showError(o.responseText); 
							},
							argument: [field.name],
							scope: this
						});
	
						form.appendChild(select);
						form.innerHTML += '<br />';
					}else{
						form.innerHTML += '<input type="text" id="' + dialogId + '_' + field.name + '" name="' + field.name + '" /><br />';
					}
				}
			}
		}
	};
	
	// Créé un nouvel onglet à la tabView.
	if(this.tabView){
		this.tab = this.createTab(this.pageId, this.label, this.icon);	
//		FIXME this.tab.on('activeChange', function(e){
//			// Si on a une nouvelle valeur (on n'a pas recliqué sur l'onglet courant).
//			if (e.newValue){
//				this.displayPage();
//			}
//		},
//		this,
//		true);
	
		// Ajoute l'onglet à la tabView.
		this.tabView.addTab(this.tab);
//		this.tabIndex = this.tabView.get('tabs').length - 1;
		this.tabIndex = this.tabView.getTabCount() - 1;
	}else{
		var panel = this.createTabContent(this.pageId);
		this.recordContainer.appendChild(panel);
	}
	
	// Si c'est du contenu personnalisé
	if(this.config.customContent){
		this.customContent = true;
	// Si c'est une carte
	}else if(this.config.map){
		this.map = new MetaBot.Map(this.pageId + "Table", this.config.map, this.id);
		
	// Si c'est un graphique
	}else if(this.config.chart){
		switch(this.config.chart.type){
		case 'datetime':
			this.chart = new MetaBot.DateChart(this.pageId + "Table", this.config.chart.label, this.config.chart.axisLabel, this.config.chart);
			break;
		case 'pie':
			this.chart = new MetaBot.PieChart(this.pageId + "Table", this.config.chart.label, this.config.chart);
			break;
		case 'area':
		case 'areaspline':
		case 'line':
			this.chart = new MetaBot.Chart(this.pageId + "Table", this.config.chart.label, this.config.chart.axisLabel, this.config.chart.type, this.config.chart);
			break;
		default:
			alert('Unsupported chart type : ' + this.config.chart.type);
			break;
		}
		
	// Création de la table de données si possible.
	}else if (!this.simpleData){
		// Définition de la source de données utilisées par la page.
		this.dataSource = new YAHOO.util.DataSource(this.source);
		this.dataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
		this.dataSource.connXhrMode = "queueRequests";
	
		// Si on a un chemin jusqu'au données, on l'indique à la dataSource.
		this.dataSource.responseSchema = {
			resultsList: this.header,
			fields: this.dataSourceFields
		};
	
		// Création de la pagination.
		var paginatorTemplate = '{Bootstrap} {BootstrapRowsPerPageDropdown}';
		this.paginator = new YAHOO.widget.Paginator({ 
		    rowsPerPage: this.rows,
		    alwaysVisible  : true,
		    template :  paginatorTemplate,
		    rowsPerPageOptions: [5, 10, 25, 50]
		});
		
		// Création de la liste des colonnes utilisées.
		var columns = new Array();
		for (var i = 0; i < this.fields.length; i++){
			var field = this.fields[i];
			
			// Si le champ est bien objet, et qu'il n'y a pas de champ noColumn.
			if(typeof(field) == 'object' && !field.noColumn){
				columns.push({
					key: field.name,
					label: field.label,
					formatter: field.formatter,
					sortable: true,
					resizeable: true,
					data: field.data
				});
			}
		}


		// Création de la table (tableau de données) affichée.
//		var tableHeight = 	parseInt(topPanel.getStyle('height')) -170;
//		var tableWidth = 	parseInt(topPanel.getStyle('width')) - 30;
		
		this.dataSource.subscribe("dataErrorEvent", function(o){
			_this.dataTable.showTableMessage("Error : " + o.response.responseText);
			_this.unlock(0, getMilliTime() - _this.startTime);
		});
		this.dataTable = new YAHOO.widget.DataTable(this.pageId + "Table", 
				columns, 
				this.dataSource, {
					initialLoad: false,
					paginator: this.paginator,
					currencyOptions: this.currencyOptions
				});

		this.dataTable.subscribe('rowMouseoverEvent', this.dataTable.onEventHighlightRow);
		this.dataTable.subscribe('rowMouseoutEvent', this.dataTable.onEventUnhighlightRow);
		this.dataTable.subscribe('rowClickEvent', this.dataTable.onEventSelectRow);			
		this.dataTable.subscribe('rowSelectEvent', function(){
				this.dataList = [];
				var rows = this.dataTable.getSelectedRows();
				for(var i = 0; i < rows.length; i++){
					this.dataList.push(this.dataTable.getRecordSet().getRecord(rows[i]));
				}
				this.data = this.dataList[0];
				this.selectedId = this.data.getData('id');
				mbLink_id = this.selectedId;	
				mbLink_update();
				if(this.tabView){
					this.loadDataForm(this.data);
				}else if(this.onDataSelection){
					this.onDataSelection(this.data, this.dataList);
				}
			},
			this,
			true);

		// Evènement appelé une fois la DataTable prête à être utilisée. On définit ici l'élément et la page sélectionnée.
		this.dataTable.subscribe('initEvent', function(){
			// Si on a un ID sélectionné (et donc à traiter) ou un arbre.
			if (this.selectedId || this.hasTree){
			    var records = this.dataTable.getRecordSet()._records;
			    
			    // On a un arbre à créer.
			    if (this.hasTree){
			    	this.createTree(records);
			    }

				// On a un objet à sélectionner.
				if (this.selectedId > 0){
				    var count = 0;
				    
				    // On examine chaque enregistrement.
				    for (var i in records){
				    	count++;
				        if (records[i].getData('id') == this.selectedId){
				            this.selectRow(records[i]);
			            	break;
			        	}
			    	}
			    
			    	// On sélectionne la page à laquelle se trouve l'item sélectionné.
			    	this.paginator.setPage(Math.floor(count / this.rows) + 1, false);
				}
			}
			this.unlock(this.dataTable.getRecordSet().getLength(), getMilliTime() - this.startTime);
		},
		this,
		true);
				
		// Si on peut créer on un arbre de données, on le fait.
		if (this.hasTree){
			this.createButtonsContainer();

			// Zone pour les boutons droits de l'écran haut.
			var rightButton = document.createElement('div');
			rightButton.setAttribute('id', this.pageId + 'RightButtonsContainer');
			rightButton.style.position = 'absolute';
			rightButton.style.right = '10px';
			rightButton.style.width = '100px';
			rightButton.style.textAlign = 'right';
			Dom.get(this.pageId + 'Buttons').appendChild(rightButton);
			
			// Création du bouton de switch arbre/table.
			var button = document.createElement('input');
			button.setAttribute('id','switchTree' + this.pageId);
			Dom.get(this.pageId + 'RightButtonsContainer').appendChild(button);
				
			this.switchButton = new YAHOO.widget.Button('switchTree' + this.pageId);		    
	    	this.switchTree(this.showTree);						
	    	this.switchButton.on('click', function()
			{			
				this.switchTree(!this.showTree);
			},
			this,
			true);
	    }
	}
	
	this.displayDataTab = function(tab){
		if(this.dataTabView){
			if(this.dataTabView.getTab(tab)){
				this.dataTabView.selectTab(tab);
			}else{
				mbLink_tab = 0;	
				mbLink_update();
				this.dataTabView.selectTab(0);
			}
		}
	};
	
	// Mise en place de la sous-form.
	this.formFunction = function(data){
		// Création du bouton de mise à jour/enregistrement.
		var updateEntry = function(isUpdate){
			for(var i = 0; i < _this.paintList.length; i++){
				_this.paintList[i].prepareForSaving();
			}
			
			// Appel de fonction réalisé avant la soumission de données.
			if (_this.beforeSubmit){
				_this.beforeSubmit();
			}
			 
			var form = Dom.get(_this.form);
			
			// Si on a bien récupéré au moins un formulaire.
			if (form){
				// On teste ensuite l'existence de formulaires secondaires, pour lesquels on récupère les données le cas échéant.
				var formParam = '';
				var i = 2;
				var f = '';
				
				do{
					formParam += f; 
					f = Connect.setForm(form);
					form = _this.form + i++;
				}while (Dom.get(form));
				
				Connect.asyncRequest('POST', 'api.php', {
					success: function(o){
						this.showInfo(o.responseText);
						this.update();
					},
					failure: function(o){
						this.showError(o.statusText);
					},
					scope: _this
				}, 'mbClass=' + _this.id + '&mbAction=ADD&' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + (isUpdate?'&id=' + data.getData('id'):'') + '&' + _this.requestParam + '&' + formParam);
			}else{
				_this.showError(ERROR_FORMNOTFOUND);
			}
			return false;
		};
		if (Dom.get('dataUpdateButton')){
			$("#dataUpdateButton").click(function(){ updateEntry(true);});
		}
		if (Dom.get('dataNewButton')){
			$("#dataNewButton").click(function(){ updateEntry(false);});
		}

		// Création du bouton de suppression.
		if (Dom.get('dataDeleteButton')){
			$("#dataDeleteButton").click(function(){
				var name = data.getData('name');
				if(!name){
					name = data.getData('name_lc');
					if(!name){
						name = '';
					}
				}
				if(_this.config.protectDeletion && prompt('Veuillez confirmer la suppression en tapant le nom exact de l\'élément :', '') != name){
					alert('Nom incorrect');
					return;
				}
				if(!confirm('Etes-vous sûr de supprimer l\'élément [' + data.getData('id') + '] ' + name + ' ?')){
					return;
				}
				var form = Dom.get(this.form);
				
				if (form){
					Connect.setForm(form);
					Connect.asyncRequest('POST', 'api.php', {
						success: function(o){
							this.showInfo(o.responseText);
							this.update();
							this.formContainer.innerHTML = '';
						},
						failure: function(o){
							this.showError(o.responseText);
						},
						scope: _this
					}, 'mbClass=' + _this.id + '&mbAction=DELETE&' + MetaBot.PROJECT_FIELD_NAME + '=' + MetaBot.PROJECT_ID + '&id=' + data.getData('id') + '&' + _this.requestParam);
				}else{
					this.showError(ERROR_FORMNOTFOUND);
				}
			});
		}

		// Création du bouton de duplication.
		if (Dom.get('dataDuplicateButton')){
//			this.addDuplicateButton('dataDuplicateButton','ajax/' + this.folder + '/add' + this.id +'.php', this.requestParam);
		}

		if(Dom.get('leftButtonDiv') && data.getData("id") != "new"){
			for(var i = 0; i < this.customFormButtonList.length; i++){
				var customButton = this.customFormButtonList[i];
				this.addCustomButton(true, this.pageId + 'customFormButton' + i, customButton);
			}
		}
		
		for(var i = 0; i < this.linkEditorList.length; i++){
			var link = this.linkEditorList[i];
			if(data.getData("id") == "new"){
				Dom.get(link.container).innerHTML = "Vous devez d'abord enregistrer l'élément.";
			}else{
				link.dataId = data.getData(link.dataIdField);
				if(Dom.get(link.container)){
					if(link.onUpdate){
						link.onUpdateHandler = function(){
							link.onUpdate(_this);
						};
					}
					link.table = createLinkEditor(link);
				}
			}
		}
		for(var i = 0; i < this.paintList.length; i++){
			var paint = this.paintList[i];
			if(data.getData("id") == "new"){
				Dom.get(link.container).innerHTML = "Vous devez d'abord enregistrer l'élément.";
			}else{
				paint.init(data);
			}
		}
		
		$canvasList = $("#" + this.formContainer.id + " canvas");
		for(var i = 0; i < $canvasList.length; i++){
			canvas = $canvasList[i];
			if(canvas.getAttribute('data-type') == 'sprite'){
				MetaBot.renderSprite(canvas);
			}
		}
		
		// Si on a une fonction de callback à appeler à la sélection d'un élément. 
		if (this.onDataSelection){
			this.onDataSelection(data);
		}
	};

	// Si la création de nouveaux éléments est autorisée.
	if (this.allowCreation && !this.customContent){
		var creationFields = [];
		for(var i = 0; i < this.fields.length; i++){
			if (this.fields[i].forCreation){
				creationFields.push(this.fields[i]);
			}
		}
		this.addNewButton(this.id + this.page + 'AddButton', 'api.php?mbAction=ADD', this.requestParam, this.newAssetLabel, creationFields);
	}
	if(this.map){
		this.addFilter({field: 'zoom', label: 'Zoom', customFilter: true, customFields: [
			{text: "25%", value: 0.25}, 
			{text: "50%", value: 0.5}, 
			{text: "75%", value: 0.75}, 
			{text: "100%", value: 1}, 
			{text: "150%", value: 1.5}, 
			{text: "200%", value: 2}, 
			{text: "400%", value: 4}
		], onclick: function(value){
			_this.map.setScale(value);
		}});
		this.addCustomButton(false, this.pageId + 'saveMap', {label: 'Enregistrer', onclick: function(){
			_this.map.save();
		}});
		this.addCustomButton(false, this.pageId + 'editLink', {label: 'Commencer un chemin', onclick: function(){
			_this.map.setLinkMode(!_this.map.getLinkMode());
			var button = $("#" + _this.pageId + "editLink");
			if(_this.map.getLinkMode()){
				button.html('Chemin terminé').addClass('btn-danger');;
			}else{
				button.html('Commencer un chemin').removeClass('btn-danger');
			}
		}});
	}

	for(var i = 0; i < this.customButtonList.length; i++){
		var customButton = this.customButtonList[i];
		this.addCustomButton(false, this.pageId + 'customButton' + i, customButton);
	}
	
	// Ajoute les filtres.
	for (var i = 0; i < this.filters.length; i++){		
		this.addFilter(this.filters[i]);
	}
	this.update();
	if(!this.tabView){
		this.displayPage();
	}
}

YAHOO.widget.Paginator.ui.BootstrapRowsPerPageDropdown = function(p){
	this.paginator = p;
	this.rowsPerPageOptions = this.paginator.get('rowsPerPageOptions');
	this.paginator.subscribe('rowsPerPageChange',this.update,this,true);

	var rowsPerPage = parseInt(YAHOO.util.Cookie.get("metaBot-rowsPerPage"));
	for(var i = 0; i < this.rowsPerPageOptions.length; i++){
		if(this.rowsPerPageOptions[i] == rowsPerPage){
			this.paginator.setRowsPerPage(rowsPerPage);
			break;
		}
	}
};
YAHOO.widget.Paginator.ui.BootstrapRowsPerPageDropdown.prototype = {
	render: function(id){
		var _this = this;
		this.btnGroup = $(document.createElement("div")).addClass("btn-group").attr("id", id);
		this.btnGroup.tooltip({
			title: _2("rows per page")
		});
		this.toggle = $(document.createElement("a")).addClass("btn dropdown-toggle").attr("data-toggle", "dropdown").attr("href", "#");
		this.label = $(document.createElement("span")).append(this.paginator.getRowsPerPage());
		this.toggle.append(this.label).append(' <span class="caret"></span>');
		this.btnGroup.append(this.toggle);
		this.menu = $(document.createElement("ul")).addClass("dropdown-menu");
		for(var i = 0; i < this.rowsPerPageOptions.length; i++){
			var li = $(document.createElement("li"));
			li.data("pageCount", this.rowsPerPageOptions[i]);
			li.append($(document.createElement("a")).attr("tabindex", "-1").attr("href", "#").text(this.rowsPerPageOptions[i]));
			this.menu.append(li);
			
			li.click(function(){
				_this.paginator.setRowsPerPage($(this).data("pageCount"));
			});
		}
		this.btnGroup.append(this.menu);
		return this.btnGroup.get(0);
	},
	update: function(){
		var date = new Date();
		date.setTime(date.getTime() + 1000 * 3600 * 24 * 30);
		YAHOO.util.Cookie.set("metaBot-rowsPerPage", this.paginator.getRowsPerPage(), {
			expires: date
		});
		this.label.text(this.paginator.getRowsPerPage());
	}
};

YAHOO.widget.Paginator.ui.Bootstrap = function(p){
	this.paginator = p;
	this.paginator.subscribe('recordOffsetChange',this.update,this,true);
	this.paginator.subscribe('totalRecordsChange',this.update,this,true);
	this.paginator.subscribe('rowsPerPageChange',this.update,this,true);
	this.maxPages = 6;
};

YAHOO.widget.Paginator.ui.Bootstrap.prototype = {
	render: function(id){
		this.container = $(document.createElement("div")).addClass("pagination");
		this.ul = $(document.createElement("ul")).attr("id", id);
		this.container.append(this.ul);
		this.buildUI();
		return this.container.get(0);
	},
	buildUI: function(){
		var _this = this;
		this.pageCount = this.paginator.getTotalPages();
		this.pageList = [];
		
		this.ul.empty();
		this.first = $(document.createElement("li")).append('<a href="#">|&lt;&lt;</a>');
		this.first.click(function(){
			_this.paginator.setPage(1);
		});
		this.ul.append(this.first);
		this.prev = $(document.createElement("li")).append('<a href="#">&lt;&lt;</a>');
		this.prev.click(function(){
			_this.paginator.setPage(_this.paginator.getCurrentPage() - 1);
		});
		this.ul.append(this.prev);
		for(var i = 0; i < Math.min(this.pageCount, this.maxPages); i++){
			var page = $(document.createElement("li")).append('<a href="#">' + (i + 1) + '</a>');
			page.data("page", i + 1);
			page.click(function(){
				_this.paginator.setPage($(this).data("page"));
			});
			this.ul.append(page);
			this.pageList.push(page);
		}
		this.next = $(document.createElement("li")).append('<a href="#">&gt;&gt;</a>');
		this.next.click(function(){
			_this.paginator.setPage(_this.paginator.getCurrentPage() + 1);
		});
		this.ul.append(this.next);
		this.last = $(document.createElement("li")).append('<a href="#">&gt;&gt;|</a>');
		this.last.click(function(){
			_this.paginator.setPage(_this.pageCount);
		});
		this.ul.append(this.last);
	},
	update: function(){
		if(this.paginator.getTotalPages() != this.pageCount){
			this.buildUI();
		}
		var currentPage = this.paginator.getCurrentPage();
		if(currentPage == 1){
			this.first.addClass("disabled");
			this.prev.addClass("disabled");
		}else{
			this.first.removeClass("disabled");
			this.prev.removeClass("disabled");
		}
		var firstPage = 1;
		var lastPage = this.pageCount;
		if(this.pageCount > this.maxPages){
			if(currentPage <= this.pageCount - this.maxPages / 2){
				firstPage = Math.max(1, Math.floor(currentPage - this.maxPages / 2));
				lastPage = firstPage + this.maxPages - 1;
			}else{
				lastPage = this.pageCount;
				firstPage = lastPage - this.maxPages + 1;
			}
		}
		for(var i = 0; i < this.pageList.length; i++){
			this.pageList[i].data("page", firstPage + i);
			this.pageList[i].children().html(firstPage + i);
			if(this.pageList[i].data("page") == currentPage){
				this.pageList[i].addClass("active");
			}else{
				this.pageList[i].removeClass("active");
			}
		}
		if(currentPage == this.pageCount){
			this.next.addClass("disabled");
			this.last.addClass("disabled");
		}else{
			this.next.removeClass("disabled");
			this.last.removeClass("disabled");
		}
	}
};


/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbPaint.js ****/
(function(MetaBot, $, undefined){

MetaBot.Paint = function(id, config){
	this.id = id;
	this.config = config;
	if(!this.config.renderWidth){
		this.config.renderWidth = 512;
	}
	if(!this.config.renderHeight){
		this.config.renderHeight = 512;
	}
};
MetaBot.Paint.prototype.init = function(data){
	var self = this;
	
	this.$container = $("#" + this.id).addClass("paint");
	this.$container.css("width", this.config.renderWidth + 50);
	this.$container.css("height", this.config.renderHeight + 10);
	
	this.$input = $('<input type="hidden" value="' + data.getData(this.config.name) + '" name="' + this.config.name + '"/>');
	this.$container.append(this.$input);
	
	this.$palette = $('<div class="palette">');
	
	this.$container.append(this.$palette);
	
	this.data = [];
	
	this.paintCanvas = document.createElement("canvas");
	this.paintCanvas.width = data.getData(this.config.widthField);
	this.paintCanvas.height = data.getData(this.config.heightField);
	this.paintGraphics = this.paintCanvas.getContext("2d");

	this.backgroundColor = false;
	this.currentColor = false;
	this.colorsByValue = {};
	for(var i = 0; i < this.config.colors.length; i++){
		var color = this.config.colors[i].color;
		var cssColor = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")";
		if(this.config.colors[i].isBackground){
			this.backgroundColor = this.config.colors[i];
			this.paintGraphics.fillColor = cssColor;
			this.paintGraphics.fillRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
		}else{
			var $elm = $('<div class="paint-color-container"><div class="paint-label">' + this.config.colors[i].text + '</div></div>');
			var $elmColor = $('<div class="paint-color"><i class="icon-ok icon-white"></i></div>');
			$elm.append($elmColor);
			if(!this.currentColor){
				this.currentColor = this.config.colors[i];
				$elm.addClass("selected");
			}
			$elmColor.css("background-color", cssColor);
			$elm.data("color", this.config.colors[i]);
			$elm.click(function(){
				self.currentColor.$elm.removeClass("selected");
				self.currentColor = $(this).data("color");
				self.currentColor.$elm.addClass("selected");
			});
			this.$palette.append($elm);
			this.config.colors[i].$elm = $elm;
		}
		this.config.colors[i].colorData = this.paintGraphics.createImageData(1, 1);
		this.config.colors[i].colorData.data[0] = color[0];
		this.config.colors[i].colorData.data[1] = color[1];
		this.config.colors[i].colorData.data[2] = color[2];
		this.config.colors[i].colorData.data[3] = color[3];
		this.colorsByValue[this.config.colors[i].value] = this.config.colors[i];
	}
	
	var dataToLoad = data.getData(this.config.name);
	for(var y = 0; y < this.paintCanvas.height; y++){
		this.data.push([]);
		for(var x = 0; x < this.paintCanvas.width; x++){
			if(dataToLoad && typeof(dataToLoad[y]) != "undefined" && typeof(dataToLoad[y][x]) != "undefined" && typeof(this.colorsByValue[dataToLoad[y][x]]) != "undefined"){
				this.data[y].push(dataToLoad[y][x]);
				this.paintGraphics.putImageData(this.colorsByValue[dataToLoad[y][x]].colorData, x, y);
			}else{
				this.data[y].push(this.backgroundColor.value);
				this.paintGraphics.putImageData(this.colorsByValue[this.backgroundColor.value].colorData, x, y);
			}
		}
	}
	
	this.renderCanvas = document.createElement("canvas");
	this.renderCanvas.className = "render-canvas";
	this.renderCanvas.width = this.config.renderWidth;
	this.renderCanvas.height = this.config.renderHeight;
	this.$container.append(this.renderCanvas);
	
	this.renderGraphics = this.renderCanvas.getContext("2d");
	
	var scaleX = this.renderCanvas.width / this.paintCanvas.width;
	var scaleY = this.renderCanvas.height / this.paintCanvas.height;
	
	this.renderGraphics.scale(scaleX, scaleY);
	
	
	this.paintGraphics.webkitImageSmoothingEnabled = false;
	this.renderGraphics.webkitImageSmoothingEnabled = false;
	this.renderGraphics.drawImage(this.paintCanvas, 0, 0, this.paintCanvas.width, this.paintCanvas.height);
	
	
	this.gridCanvas = document.createElement("canvas");
	this.gridCanvas.className = "grid-canvas";
	this.gridCanvas.width = this.config.renderWidth;
	this.gridCanvas.height = this.config.renderHeight;
	this.$container.append(this.gridCanvas);
	
	this.gridGraphics = this.gridCanvas.getContext("2d");
	this.gridGraphics.strokeStyle = "rgb(127, 127, 127)";
	this.gridGraphics.lineWidth = 1;
	this.gridGraphics.beginPath();
	for(var x = 0; x <= this.paintCanvas.width; x++){
		this.gridGraphics.moveTo(Math.floor(x * scaleX), 0);
		this.gridGraphics.lineTo(Math.floor(x * scaleX), this.gridCanvas.height);
	}
	for(var y = 0; y <= this.paintCanvas.height; y++){
		this.gridGraphics.moveTo(0, y * scaleY);
		this.gridGraphics.lineTo(this.gridCanvas.width, y * scaleY);
	}
	this.gridGraphics.stroke();
	this.gridGraphics.closePath();
	this.renderCanvas.addEventListener("mousemove", function(e){
		self.drawPixel(e);
	});
	this.renderCanvas.addEventListener("mousedown", function(e){
		self.drawPixel(e);
	});
	$(this.gridCanvas).on("contextmenu", function(){
		return false;
	});
	this.gridCanvas.addEventListener("mousemove", function(e){
		self.drawPixel(e);
	});
	this.gridCanvas.addEventListener("mousedown", function(e){
		self.drawPixel(e);
	});
	$(this.gridCanvas).on("contextmenu", function(){
		return false;
	});
};

MetaBot.Paint.prototype.drawPixel = function(e){
	if(e.which){
		var x = Math.floor(e.offsetX * this.paintCanvas.width / this.renderCanvas.width);
		var y = Math.floor(e.offsetY * this.paintCanvas.height / this.renderCanvas.height);
		var color = e.which==1?this.currentColor:this.backgroundColor;
		console.log(x + "," + y);
		console.log(color);
		this.paintGraphics.putImageData(color.colorData, x, y);
		this.renderGraphics.drawImage(this.paintCanvas, 0, 0, this.paintCanvas.width, this.paintCanvas.height);
		this.data[y][x] = color.value;
	}
	e.preventDefault();
};
MetaBot.Paint.prototype.prepareForSaving = function(){
	if(this.$input){
		this.$input.val(JSON.stringify(this.data));
	}
};

})(window.MetaBot = window.MetaBot || {}, window.jQuery);

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbPieChart.js ****/
(function(MetaBot, $, undefined){

MetaBot.PieChart = function(container, title, config){
	this.config = config;
	this.title = title;
	this.container = container;
};
MetaBot.PieChart.prototype.update = function(data){
	this.chart = $("#" + this.container).highcharts({
		chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
		},
		title: {
			text: this.title
		},
        tooltip: {
    	    pointFormat: this.config.format?this.config.format:'{series.name}: <b>{point.percentage:.1f}%</b>'
        },
		xAxis: {
			type: 'datetime',
			maxZoom: 24 * 3600000,
			title: {
				text: null
			}
		},
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    format: this.config.format?this.config.format:'<b>{point.name}</b>: {point.percentage:.1f} %'
                }
            }
        },
		legend: {
			enabled: true
		},
		series: data.series
	});
};

})(window.MetaBot = window.MetaBot || {}, window.jQuery);


/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbTab.js ****/
var mbTab = function(config){
	var _this = this;
	this.id = mbTab.tabCount++;
    this.config = config;
    
    this.linkElm = $('<a href="#mbTab' + this.id + '" data-toggle="tab">' + this.config.label + '</a>');
    this.linkElm.click(function(){
    	_this.triggerChangeEvent();
    });
    this.navElm = $("<li>").append(this.linkElm);
    this.contentElm = $("<div>").addClass("tab-pane fade").attr("id", "mbTab" + this.id).append(this.config.content);
    this.onChangeListenerList = [];
};
mbTab.tabCount = 0;

mbTab.prototype.triggerChangeEvent = function(){
	for(var i = 0; i < this.onChangeListenerList.length; i++){
		this.onChangeListenerList[i]();
	}
};

mbTab.prototype.getNavElm = function(){
	return this.navElm;
};

mbTab.prototype.show = function(){
	this.linkElm.tab('show');
	this.triggerChangeEvent();
};

mbTab.prototype.getContentElm = function(){
	return this.contentElm;
};

mbTab.prototype.onChange = function(listener){
	this.onChangeListenerList.push(listener);
};

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbTabView.js ****/
var mbTabView = function(parent) {
	this.parent = $(parent);
	this.id = "mbTabView-" + mbTabView.tabViewCount++;
	this.root = $("<div>").addClass("tabbable").attr("id", this.id);
	this.parent.append(this.root);

	this.nav = $("<ul>").addClass("nav nav-tabs");
	this.root.append(this.nav);
	this.content = $("<div>").addClass("tab-content");
	this.root.append(this.content);

	this.tabList = [];
};
mbTabView.tabViewCount = 0;

mbTabView.prototype.selectTab = function(index) {
	this.tabList[index].show();
	$('.nav-tabs').button('toggle');
};

mbTabView.prototype.addTab = function(tab) {
	this.tabList.push(tab);
	this.nav.append(tab.getNavElm());
	this.content.append(tab.getContentElm());
};

mbTabView.prototype.getTabCount = function(){
	return this.tabList.length;
};


/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbTree.js ****/
// Arbre d'afficahge javascript.
// id -> ID HTML de l'élément dans lequel insérer l'arbre.
// name -> nom de l'arbre.
// label
// nodeState -> vrai si les noeuds sont ouverts par défaut sinon faux.
function mbTree(id, name, nodeState, label, event)
{
	var gObject = this;
	this.nodeState = nodeState;

	this.getRootNode = function()
	{
		return this.root;
	};
	
	this.getName = function()
	{
		return this.name;			
	};
				
	this.getAutoId = function()
	{
		return ++this.auto;
	};
	
	// On efface tout le contenu de l'arbre.
	this.clear = function()
	{
		Dom.get(this.name + '1').innerHTML = '';
		this.auto = 0;
		this.root = new Node(label, 0);
		
		var tree = document.createElement('div');
		tree.setAttribute('id', this.name + this.auto);
		tree.className = 'jsTree';
		
		var item = document.createElement('div');
		item.setAttribute('id', gObject.getName() + this.root.getAutoId());
		item.className = 'item';
		
		var subItemId = gObject.getName() + gObject.getAutoId() + 'SubItem';
		var subItem = document.createElement('div');
		subItem.setAttribute('id', subItemId);
		if (this.event)
		{
			subItem.className = 'subitem';
		}
		subItem.innerHTML = this.label();
		item.appendChild(subItem);
		tree.appendChild(item);

		if (this.event)
		{
			Event.addListener(subItemId, 'click', this.event);
		}
		
		var panel = Dom.get(id);
		panel.innerHTML = '';
		panel.appendChild(tree);
	};
	
	this.id = id;

	this.name = name;
	this.auto = 0;
	this.root = new Node(label, 0);
	this.event = event;
	this.label = label;
	
	var tree = document.createElement('div');
	tree.setAttribute('id', this.name + this.auto);
	tree.className = 'jsTree';
	
	var item = document.createElement('div');
	item.setAttribute('id', gObject.getName() + this.root.getAutoId());
	item.className = 'item';
	
	var subItemId = gObject.getName() + gObject.getAutoId() + 'SubItem';
	var subItem = document.createElement('div');
	subItem.setAttribute('id', subItemId);
	if (this.event)
	{
		subItem.className = 'subitem';
	}
	subItem.innerHTML = this.label();
	item.appendChild(subItem);
	tree.appendChild(item);
	
	// Si on a un évènement associé.
	if (this.event)
	{
		Event.addListener(subItemId, 'click', this.event);
	}
	
	var panel = Dom.get(id);
	panel.appendChild(tree);
					
	// Classe pour gérer les noeuds.
	function Node(label, parent)
	{			
		var gNode = this;						// Référence le noeud courant.
		
		this.auto = gObject.getAutoId();		// Id unique du noeud.
		this.nodeList = new Array();			// Liste des noeuds enfants.
		this.parent = parent;					// Noeud parent.
		this.label = '';						// Label affiché du noeud.
		
		// Ouvre/Ferme un élément d'un arbre mbTree.
		this.switchElement = function()
		{
			var arrow = Dom.get(gObject.getName() + this.auto + 'Arrow');
			var content = Dom.get(gObject.getName() + this.auto + 'Content');
			
			if (content.className == 'nodeHidden')
			{
				content.className = 'nodeVisible';
				arrow.innerHTML = '▼'; 
			}
			else
			{
				content.className = 'nodeHidden';
				arrow.innerHTML = '►';
			}
		};
		
		// Récupère la liste des noeuds enfants.		
		this.getNodeList = function()
		{
			this.nodeList.clear();
		};
		
		// Récupère la valeur de l'auto-increment (id) des noeuds l'arbre.
		this.getAutoId = function()
		{
			return this.auto;
		};
		
		// Ajoute un nouveau noeud à l'arbre.
		this.addNode = function(label, onclick, parameter)
		{
			this.label = label;
			
			var node = new Node(label, this.auto);
			var subItemId = gObject.getName() + gObject.getAutoId() + 'SubItem';
						
			// Si on n'a pas encore d'item dans le noeud courant, on ajoute la zone d'expansion.
			if (this.nodeList.length == 0)
			{
				var root = Dom.get(gObject.getName() + this.auto);

				// On récupère l'ancien noeud.
				oldNode = root.firstChild;
				root.removeChild(oldNode);
				
				// Division affichant la flêche de déroulement d'un élément.
				var arrowId = gObject.getName() + this.auto + 'Arrow';
				var arrow = document.createElement('div');
				arrow.setAttribute('id', arrowId);
				arrow.className = 'arrow';
				arrow.innerHTML = ((gObject.nodeState) ? '▼' : '►');
				root.appendChild(arrow);
				
				Event.addListener(arrowId, 'click', function()
				{
					gNode.switchElement();
				});
				
				// Remet en place le bon noeud de contenu.
				root.appendChild(oldNode);
				
				var content = document.createElement('div');
				content.setAttribute('id', gObject.getName() + this.auto + 'Content');
				content.className = ((gObject.nodeState) ? 'nodeVisible' : 'nodeHidden');
				root.appendChild(content);
			}

			this.nodeList[node.getAutoId()] = node;
						
			var item = document.createElement('div');
			item.setAttribute('id', gObject.getName() + node.getAutoId());
			item.className = 'item';
			
			var subItem = document.createElement('div');
			subItem.setAttribute('id', subItemId);
			subItem.className = 'subitem';
			subItem.innerHTML = label;
			item.appendChild(subItem);
									
			Event.addListener(subItemId, 'click', onclick, parameter);
			Dom.get(gObject.getName() + this.auto + 'Content').appendChild(item);		
			
			return node;
		};
	}
}

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbUploadButton.js ****/
/*
 * 
 * 
 * 
 *   TODO Système à achever. 
 * 
 * 
 * 
 */

var mbUploadButton_button = 0;

function mbUploadButton(label, id, file, where, callback)
{
	this.id = 'uploadButton' + ++mbUploadButton_button;
	this.lockStyle = false;
	this.file = file;
	
	var container = Dom.get(id);
	if (container)
	{		
		// Formulaire de conteneur.
		var form = document.createElement('form');
		form.style.position = 'relative';
		form.setAttribute('id', this.id + 'Form');
		form.setAttribute('name', this.id + 'Form');
				
		// Input fichier, caché.
		var file = document.createElement('input');
		file.setAttribute('type', 'file');
		file.setAttribute('id', this.id + 'File');
		file.style.opacity = '0';
		file.style.margin = '2px 0px 0px 1px';
		file.style.cursor = 'pointer';
		file.style.position = 'absolute';
		file.style.top = '0px';
		file.style.left = '3px';
		file.style.cursor = 'pointer';
		form.appendChild(file);		
		Event.addListener(file, 'mouseover', function()
		{
			if (!this.lockStyle)
			{
				this.lockStyle = true;
				
				/*var mouseEvent = document.createEvent("MouseEvents");
				mouseEvent.initMouseEvent('mouseover', true, false, window, 0, 0, 0, 0, 0 , false, false, false, false, 0, null);
				var button = document.getElementById(this.id + 'Button-button');
				button.dispatchEvent(mouseEvent);*/
				this.sendMouseEvent('mouseover');
			}			
			
			
			/*alert(document.body.style.cursor);
			document.body.style.cursor = 'pointer';
			alert(document.body.style.cursor);*/
		},
		this,
		true);

		Event.addListener(file, 'mouseout', function()
		{
			if (this.lockStyle)
			{
				this.lockStyle = false;
				/*
				var mouseEvent = document.createEvent("MouseEvents");
				mouseEvent.initMouseEvent('mouseout', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				var button = document.getElementById(this.id + 'Button-button');
				button.dispatchEvent(mouseEvent);*/
				this.sendMouseEvent('mouseout');
				
				document.body.style.cursor = 'default';
			}
		},
		this,
		true);
		
		Event.addListener(file, 'mousedown', function()
		{
			this.sendMouseEvent('mousedown');
		},
		this,
		true);

		// Au changement de fichier, on envoie !
		Event.addListener(file, 'change', function()
		{			
//			var file = Dom.get(this.id + 'File');
			var form = Dom.get(this.id + 'Form');

			if (file.value)
			{
				Connect.setForm(Dom.get(this.id + 'Form'), true, true);
				Connect.asyncRequest('post', this.file,
				{
					upload: function(o)
					{
						// Si on a un callback, on appelle.
						if (callback)
						{
							callback(YAHOO.lang.JSON.parse(o.responseText));
						}
						form.reset();
						alert(file.value);
					},
					failure: function(o)
					{
						alert(o.responseText);
					}
				},where);	
			}
		},
		this,
		true);
		
		// Input button, "par dessus".
		var button = document.createElement('input');
		button.setAttribute('id', this.id + 'Button');
		button.setAttribute('type', 'button');
		button.setAttribute('value', label);
		button.style.position = 'absolute';
		button.style.top = '0px';
		button.style.left = '0px';
		
		form.appendChild(button);

		// Ajoute le formulaire au conteneur.
		container.appendChild(form);

		var uploadButton = new YAHOO.widget.Button(this.id + 'Button');
		Dom.get(this.id + 'Button-button').style.width = '230px';
		uploadButton.addClass('icon_database_go');
		
		this.sendMouseEvent = function(event)
		{
			var mouseEvent = document.createEvent("MouseEvents");
			mouseEvent.initMouseEvent(event, true, false, window, 0, 0, 0, 0, 0 , false, false, false, false, 0, null);
			var button = document.getElementById(this.id + 'Button-button');
			button.dispatchEvent(mouseEvent);	
		};
		
		/*
			document.getElementById(this.id + 'File').focus();
			
			var evt = document.createEvent("MouseEvents");
			evt.initMouseEvent('click', true, false, window, 0, 608,561,608,426, false, false, false, false, 0, null);
			var cb = document.getElementById(this.id + 'File');
			var canceled = !cb.dispatchEvent(evt);
						  
			if(canceled)
			{
			    // Un gestionnaire a appelé preventDefault
			    alert("canceled");
			}
			else
			{
				// Aucun gestionnaire n'a appelé preventDefault
				alert("not canceled");
			}
		}	*/	
	}else{
		alert('Impossible de créer le bouton d\'upload sur l\'id [' + id + ']');
	}
}

/**** /home/www/tools-available/awscostsweb/vendor/lib3dduo/casualCrossing/metabot/static/src/js/mbUserAccessManager.js ****/
(function(MetaBot){
	MetaBot.userAccessManager = {
		getAccessLevel: function(menu, page){
			var accessLevel = 0;
			if(typeof(userAccessData) != "undefined"){
				if(typeof(page) != "undefined" && typeof(userAccessData.pageAccessLevel[page]) != "undefined"){
					accessLevel = userAccessData.pageAccessLevel[page];
				}else if(typeof(menu) != "undefined" && typeof(userAccessData.menuAccessLevel[menu]) != "undefined"){
					accessLevel = userAccessData.menuAccessLevel[menu];
				}else{
					accessLevel = userAccessData.defaultAccessLevel;
				}
			}
			return accessLevel;
		},
		hasAccess: function(minLevel, maxLevel, menu, page){
			var res = true;
			if(typeof(userAccessData) != "undefined"){
				var accessLevel = this.getAccessLevel(menu, page);
				res = (!minLevel || accessLevel >= minLevel) && (!maxLevel || accessLevel <= maxLevel);
			}
			return res;
		}
	};
})(window.MetaBot = window.MetaBot || {});