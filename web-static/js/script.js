
/******* D:\GitHub\raptor-web-config\app\tools/../../web-static-src/js/config.js *******/
var configPage = {
	id: 'config',
	label: 'Configuration',
	fields: [
		{name: 'id', label: 'Id'},
		{name: 'name', label: 'Name'},
		{name: 'identifier', label: 'Identifier'},
		{name: 'value', label: 'Value'},
		{name: 'type_name', label: 'Type'}
	],
	formTabs: [
		{name: 'properties', label: 'Properties', fields: [
			{name: 'name', label: 'Name'},
			{name: 'identifier', label: 'Identifier'},
			{name: 'value', label: 'Value'},
			{name: 'type', label: 'Type', type: 'select', table: 'config_type'}
		]}
	],
	filters: [
		{field: 'type', label: 'Type', table: 'config_type'}
	]
};

var configTypePage = {
	id: 'configType',
	label: 'Configuration Type',
	fields: [
		{name: 'id', label: 'Id'},
		{name: 'name', label: 'Name'},
		{name: 'identifier', label: 'Identifier'}
	],
	formTabs: [
		{name: 'properties', label: 'Properties', fields: [
			{name: 'name', label: 'Name'},
			{name: 'identifier', label: 'Identifier'}
		]}
	]
};

var configMenu = new mbMenuButton({
	id: 'config',
	label: 'Configuration',
	pageConfigList: [
		configPage,
		configTypePage
	]
});

/******* D:\GitHub\raptor-web-config\app\tools/../../web-static-src/js/levels.js *******/
var levelPage = {
	id: 'level',
	label: 'Level',
	fields: [
		{name: 'id', label: 'Id'},
		{name: 'name', label: 'Name'},
		{name: 'number', label: 'Number'}
	],
	formTabs: [
		{name: 'properties', label: 'Properties', fields: [
			{name: 'name', label: 'Name'},
			{name: 'number', label: 'Number'},
			{name: 'background', label: 'Background image asset'},
			{name: 'music_boss', label: 'Music asset for boss'},
			{name: 'music_defeat', label: 'Music asset for defeat'},
			{name: 'music_fight', label: 'Music asset for fight'},
			{name: 'music_victory', label: 'Music asset for victory'}
		]}
	]
};

var enemyTypePage = {
		id: 'enemyType',
		label: 'Enemy Type',
		fields: [
			{name: 'id', label: 'Id'},
			{name: 'name', label: 'Name'},
			{name: 'type', label: 'Type'},
			{name: 'boss', label: 'Boss'}
		],
		formTabs: [
			{name: 'properties', label: 'Properties', fields: [
				{name: 'name', label: 'Name'},
				{name: 'type', label: 'Type'},
				{name: 'boss', label: 'Boss'}
			]}
		],
		filters: [
		  	{field: 'id', label: 'Boss', table: 'enemy_type_boss'}
		]
	};

var enemyPage = {
		id: 'enemy',
		label: 'Enemies',
		fields: [
			{name: 'id', label: 'Id'},
			{name: 'level_name', label: 'Level'},
			{name: 'type_name', label: 'Type'},
			{name: 'boss', label: 'Boss'},
			{name: 'pos_x', label: 'Pos on map (X)'},
			{name: 'pos_y', label: 'Pos on map (Y)'}
		],
		formTabs: [
			{name: 'properties', label: 'Properties', fields: [
			    {name: 'level', label: 'Level', type: 'select', table: 'level'},
			    {name: 'type', label: 'Type', type: 'select', table: 'enemy_type'},
				{name: 'pos_x', label: 'Pos on map (X)'},
				{name: 'pos_y', label: 'Pos on map (Y)'}
			]}
		],
		filters: [
		  	{field: 'level', label: 'Level', table: 'level'},
			{field: 'type', label: 'Type (all)', table: 'enemy_type'},
			{field: 'type', label: 'Type (boss only)', table: 'enemy_type_boss'}
		]
	};

var levelsMenu = new mbMenuButton({
	id: 'levelsMenu',
	label: 'Levels',
	pageConfigList: [
	    levelPage,
		enemyTypePage,
		enemyPage
	]
});
