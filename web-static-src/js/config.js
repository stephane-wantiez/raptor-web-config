var configPage = {
	id: 'config',
	label: 'Configuration',
	fields: [
		{name: 'id', label: 'Id'},
		{name: 'name', label: 'Name'},
		{name: 'identifier', label: 'Identifier'},
		{name: 'value', label: 'Value'},
		{name: 'type', label: 'Type'}
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
		{field: 'config_type', label: 'Type', table: 'config_type'}
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