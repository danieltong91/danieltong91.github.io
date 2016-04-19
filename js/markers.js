var markers = [];

function onMarkerHover( event ){
	var hx = event.clientX - window.innerWidth * 0.5;
	var hy = event.clientY - window.innerHeight * 0.5;
	var dx = mouseX - hx;
	var dy = mouseY - hy;
	var d = Math.sqrt( dx * dx + dy * dy );
	// if( event.target.style.visibility == 'visible' )
	// 	console.log('clicked on something!!');				
}

function attachMarkerToCountry( countryName, importance ){
	//	look up the name to mesh
	countryName = countryName.toUpperCase();
	var country = countryData[countryName];
	if( country === undefined )
		return;

	var container = document.getElementById( 'visualization' );	
	var template = document.getElementById( 'marker_template' );
	var marker = template.cloneNode(true);

	country.marker = marker;
	container.appendChild( marker );

	marker.countryName = countryName;

	marker.importance = importance;
	marker.selected = false;
	marker.hover = false;
    if( countryName === selectedCountry.countryName.toUpperCase() )
		marker.selected = true;

	marker.setPosition = function(x,y,z){
		this.style.left = x + 'px';
		this.style.top = y + 'px';	
		this.style.zIndex = z;
	}

	marker.setVisible = function( vis ){
		if( ! vis )
			this.style.display = 'none';
		else{
			this.style.display = 'inline';
		}
	}
    var countryLayer = marker.querySelector( '#countryText');
    marker.countryLayer = countryLayer;
	var detailLayer = marker.querySelector( '#detailText' );
	marker.detailLayer = detailLayer;
    marker.jquery = $(marker);
	marker.setSize = function( s ){
	    var detailSize = Math.floor(2 + s * 0.5);	
		this.detailLayer.style.fontSize = detailSize + 'pt';
        var totalHeight = detailSize * 2;
		this.style.fontSize = totalHeight * 1.125 + 'pt';
		if(detailSize <= 8) {
            this.countryLayer.style.marginTop = "0px";  
		} else {
		    this.countryLayer.style.marginTop = "-1px";
		}
	}

	marker.update = function(){
		var matrix = rotating.matrixWorld;
		var abspos = matrix.multiplyVector3( country.center.clone() );
		var screenPos = screenXY(abspos);			

		var s = 0.3 + camera.scale.z * 1;
		var importanceScale = this.importance / 30000; //5000000
		importanceScale = constrain( importanceScale, 0, 18 );
		s += importanceScale;

		if( this.tiny )
			s *= 0.75;

		if( this.selected )
			s = 30;

		if( this.hover )
			s = 15;
		
		this.setSize( s ); 

		// if( this.selected )
			// this.setVisible( true )
		// else
			this.setVisible( ( abspos.z > 60 ) && s > 3 );	

		var zIndex = Math.floor( 1000 - abspos.z + s );
		if( this.selected || this.hover )
			zIndex = 10000;

		this.setPosition( screenPos.x, screenPos.y, zIndex );	
	}

	var nameLayer = marker.querySelector( '#countryText' );		

	//	right now, something arbitrary like 10 mil dollars or more to be highlighted
	var tiny = (importance < 150000) && (!marker.selected);	//20000000
	marker.tiny = tiny;

	// if( tiny )
	// 	nameLayer.innerHTML = country.countryCode;	
	// else
		nameLayer.innerHTML = countryName.replace(' ','&nbsp;');	

	// marker.nameLayer = nameLayer;
	// marker.nameLayerText = countryName;
	// marker.nameLayerShorten = country.countryCode;;	

	var btwCen = {"year": {'LIBERIA': 2.368e-05, 'CHAD': 0.00026, 'ERITREA': 0.00081, 'INDONESIA': 2.36798e-05, 'TOGO': 0.000165, 'SOUTH SUDAN': 0.001041, 'UGANDA': 0.00251, 'MAURITANIA': 0.000213, 'VENEZUELA, BOLIVARIAN REPUBLIC OF': 4.73597e-05, 'ALGERIA': 4.73597e-05, 'EGYPT': 0.00031, 'SENEGAL': 0.000189, 'ETHIOPIA': 0.00729, 'SERBIA': 0.0002368, 'CONGO': 0.0001184, 'MALI': 0.0003552, 'SYRIAN ARAB REPUBLIC': 0.002439, 'ANGOLA': 0.0002842, 'CONGO, THE DEMOCRATIC REPUBLIC OF THE': 0.00419, 'SUDAN': 0.00208, 'NEPAL': 9.47194e-05, 'UNITED STATES': 0.000758, 'ZIMBABWE': 0.00021312, 'SOMALIA': 0.0054937, 'RUSSIAN FEDERATION': 0.001113, 'IRAQ': 0.002794, 'TURKEY': 0.001705, 'BANGLADESH': 7.10395e-05, 'GUINEA': 4.7359696e-05, "C\U00F4TE D'IVOIRE": 0.0002367, 'CENTRAL AFRICAN REPUBLIC': 0.00082879, 'CHINA': 0.000142, 'BOSNIA AND HERZEGOVINA': 0.000236, 'ARMENIA': 4.73597e-05, 'GAMBIA': 4.73597e-05, 'KENYA': 0.0076, 'CAMEROON': 7.1039e-05}};
	var btw = btwCen.year;
	var eigCen = {"year": {'LIBERIA': 1.4448e-33, 'CHAD': 8.96309e-07, 'ERITREA': 2.6975e-05, 'SYRIAN ARAB REPUBLIC': 0.491998, 'TOGO': 1.4225e-52, 'SOUTH SUDAN': 1.28324e-05, 'UGANDA': 1.4972e-08, 'MAURITANIA': 3.2325e-31, 'CENTRAL AFRICAN REPUBLIC': 7.7255e-07, 'ETHIOPIA': 3.50282e-05, 'RWANDA': 2.4446e-07, 'MALI': 4.0236e-31, 'AFGHANISTAN': 0.068542, 'CONGO, THE DEMOCRATIC REPUBLIC OF THE': 1.09238e-06, 'SUDAN': 2.12637e-05, 'GHANA': 6.32982e-52, 'IRAQ': 0.37239, 'STATE OF PALESTINE': 0.01897, 'TURKEY': 0.029425, "C\U00F4TE D'IVOIRE": 3.25716e-32, 'IRAN, ISLAMIC REPUBLIC OF': 0.015674, 'BURUNDI': 5.829897e-08, 'KENYA': 5.17249e-07, 'SOMALIA': 0.002895}};
	var eig = eigCen.year;
	var katzCen = {"year": {'ERITREA': 1.0001, "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF": 1.0, 'PORTUGAL': 1.0, 'MONTENEGRO': 1.0, 'ANTIGUA AND BARBUDA': 1.0, 'BAHAMAS': 1.0, 'TOGO': 1.0000041, 'ARUBA': 1.0, 'CAMBODIA': 1.0000064, 'GUINEA-BISSAU': 1.0, 'KIRIBATI': 1.0, 'BARBADOS': 1.0, 'BENIN': 1.0, 'VENEZUELA, BOLIVARIAN REPUBLIC OF': 1.0000036, 'IRAQ': 1.000201, 'ALGERIA': 1.000000679, 'TAJIKISTAN': 1.0, 'COSTA RICA': 1.0, 'ETHIOPIA': 1.0000365, 'SWEDEN': 1.0, 'RWANDA': 1.0000384, 'TIMOR-LESTE': 1.0, 'OMAN': 1.0, 'SURINAME': 1.0, 'CURA\xc3\xa7AO': 1.0, 'NORWAY': 1.0, 'BOLIVIA, PLURINATIONAL STATE OF': 1.0, 'QATAR': 1.0, 'PALAU': 1.0, 'SUDAN': 1.00032, 'DENMARK': 1.0, 'NEPAL': 1.0000036, 'AZERBAIJAN': 1.000004, 'PAPUA NEW GUINEA': 1.0, 'UNITED STATES': 1.000002, 'ZIMBABWE': 1.00000871, 'GABON': 1.0, 'GIBRALTAR': 1.0, 'SWAZILAND': 1.0, 'VANUATU': 1.0, 'YEMEN': 1.0, 'ECUADOR': 1.0, 'UZBEKISTAN': 1.0000016, 'AUSTRALIA': 1.0, 'KUWAIT': 1.0, "C\U00F4TE D'IVOIRE": 1.0000412, 'FRANCE': 1.0, 'TRINIDAD AND TOBAGO': 1.0, 'IRAN, ISLAMIC REPUBLIC OF': 1.00003628, 'SENEGAL': 1.0000089, 'SRI LANKA': 1.000061, 'CROATIA': 1.00002471, 'TURKS AND CAICOS ISLANDS': 1.0, 'COMOROS': 1.0, 'TONGA': 1.0, 'NETHERLANDS': 1.0, 'HONDURAS': 1.00000108, 'LIBYA': 1.0, 'DOMINICAN REPUBLIC': 1.0, 'SYRIAN ARAB REPUBLIC': 1.001248, 'VIET NAM': 1.00016, 'MOZAMBIQUE': 1.0, 'SOUTH SUDAN': 1.0000581, 'COLOMBIA': 1.0000525, 'SWITZERLAND': 1.0, 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF': 1.0, 'CANADA': 1.0, 'JAMAICA': 1.0, 'EQUATORIAL GUINEA': 1.0, 'EGYPT': 1.00000491, 'CUBA': 1.00000085, 'LEBANON': 1.00000056, 'MONGOLIA': 1.0, 'BOTSWANA': 1.0, 'AUSTRIA': 1.0, 'CONGO': 1.00000383, 'MALI': 1.000078, 'NEW ZEALAND': 1.0, 'ZAMBIA': 1.0, 'COOK ISLANDS': 1.0, 'PAKISTAN': 1.00001442, 'SEYCHELLES': 1.0, 'ANGOLA': 1.00000279, 'ARMENIA': 1.00000419, 'SAINT LUCIA': 1.0, 'SAINT KITTS AND NEVIS': 1.0, 'MALAYSIA': 1.0, 'SAINT VINCENT AND THE GRENADINES': 1.00000078, 'GHANA': 1.0000098, 'IRELAND': 1.0, 'RUSSIAN FEDERATION': 1.00003484, 'GRENADA': 1.0, 'NIGERIA': 1.0000102, 'HONG KONG': 1.0, 'KYRGYZSTAN': 1.0, 'BANGLADESH': 1.00000425, 'ESTONIA': 1.0, 'SLOVENIA': 1.0, 'ICELAND': 1.0, 'BRUNEI DARUSSALAM': 1.0, 'LESOTHO': 1.0, 'TUNISIA': 1.0, 'BRITISH VIRGIN ISLANDS': 1.0, 'BOSNIA AND HERZEGOVINA': 1.0000125, 'MONACO': 1.0, 'JAPAN': 1.0, 'UKRAINE': 1.00000152, 'STATELESS': 1.0000073, 'ISRAEL': 1.0, 'CHAD': 1.0000057, 'MEXICO': 1.0000047, 'TUVALU': 1.0, 'MOLDOVA, REPUBLIC OF': 1.000000524, 'LITHUANIA': 1.0, 'UNITED KINGDOM': 1.0, 'MOROCCO': 1.0, 'GEORGIA': 1.00000132, 'MACAO': 1.0, 'UGANDA': 1.00000197, 'THAILAND': 1.0, 'SIERRA LEONE': 1.0, 'BRAZIL': 1.0, 'MADAGASCAR': 1.0, 'ALBANIA': 1.00000425, 'CABO VERDE': 1.0, 'SOUTH AFRICA': 1.0, 'GERMANY': 1.0, 'NIGER': 1.0, 'NICARAGUA': 1.0, 'MALAWI': 1.0, 'NIUE': 1.0, 'AFGHANISTAN': 1.00130034, 'SAUDI ARABIA': 1.0, 'INDONESIA': 1.0000045, 'ITALY': 1.0, 'PERU': 1.0000009, 'PHILIPPINES': 1.0, 'VARIOUS': 1.000052, 'SOMALIA': 1.000567, 'ARGENTINA': 1.0, 'CYPRUS': 1.0, 'TANZANIA, UNITED REPUBLIC OF': 1.0, 'BAHRAIN': 1.0, 'MALDIVES': 1.0, 'WESTERN SAHARA': 1.000046, 'TIBETANS': 1.0000076, 'CAYMAN ISLANDS': 1.0, 'MARSHALL ISLANDS': 1.0, 'LATVIA': 1.0, 'CHINA': 1.000098, 'GUYANA': 1.0, 'BELGIUM': 1.0, 'GAMBIA': 1.00000058, 'KOREA, REPUBLIC OF': 1.0, 'BURKINA FASO': 1.0, 'LIBERIA': 1.00000775, 'KAZAKHSTAN': 1.0, 'MAURITIUS': 1.0, 'LIECHTENSTEIN': 1.0, 'MYANMAR': 1.00011, 'NAMIBIA': 1.0, 'GREECE': 1.0, 'SLOVAKIA': 1.0, 'BELIZE': 1.0, 'FIJI': 1.0, 'ROMANIA': 1.0, 'BELARUS': 1.00000104, 'CZECH REPUBLIC': 1.0, 'EL SALVADOR': 1.0000043, 'POLAND': 1.0, 'INDIA': 1.00000484, 'LUXEMBOURG': 1.0, "LAO PEOPLE'S DEMOCRATIC REPUBLIC": 1.0000037, 'SOLOMON ISLANDS': 1.0, 'SERBIA': 1.0000213, 'HUNGARY': 1.0, 'SPAIN': 1.0, 'CONGO, THE DEMOCRATIC REPUBLIC OF THE': 1.00025, 'MAURITANIA': 1.000017, 'UNITED ARAB EMIRATES': 1.0, 'FINLAND': 1.0, 'MALTA': 1.0, 'ANDORRA': 1.0, 'DJIBOUTI': 1.0, 'JORDAN': 1.0, 'SINT MAARTEN (DUTCH PART)': 1.0, 'KENYA': 1.0000038, 'PARAGUAY': 1.0, 'STATE OF PALESTINE': 1.000046, 'DOMINICA': 1.0, 'TURKEY': 1.000032, 'SAO TOME AND PRINCIPE': 1.0, 'SAMOA': 1.0, 'TURKMENISTAN': 1.0, 'BHUTAN': 1.0000158, 'URUGUAY': 1.0, 'GUINEA': 1.0000053, 'PANAMA': 1.0, 'SINGAPORE': 1.0, 'SAN MARINO': 1.0, 'CENTRAL AFRICAN REPUBLIC': 1.00012634, 'GUATEMALA': 1.0000027, 'CHILE': 1.0, 'BURUNDI': 1.000034, 'HAITI': 1.000019, 'CAMEROON': 1.0000029, 'BULGARIA': 1.0}};
	var katz = katzCen.year;
	var pgRank = {"year": {'ERITREA': 1, "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF": 1, 'PORTUGAL': 1, 'MONTENEGRO': 1, 'ANTIGUA AND BARBUDA': 1, 'BAHAMAS': 1, 'TOGO': 1, 'ARUBA': 1, 'CAMBODIA': 1, 'GUINEA-BISSAU': 1, 'KIRIBATI': 1, 'BARBADOS': 1, 'BENIN': 1, 'VENEZUELA, BOLIVARIAN REPUBLIC OF': 1, 'IRAQ': 1, 'ALGERIA': 1, 'TAJIKISTAN': 1, 'COSTA RICA': 1, 'ETHIOPIA': 1, 'SWEDEN': 1, 'RWANDA': 1, 'TIMOR-LESTE': 1, 'OMAN': 1, 'SURINAME': 1, 'CURA\xc3\xa7AO': 1, 'NORWAY': 1, 'BOLIVIA, PLURINATIONAL STATE OF': 1, 'QATAR': 1, 'PALAU': 1, 'SUDAN': 1, 'DENMARK': 1, 'NEPAL': 1, 'AZERBAIJAN': 1, 'PAPUA NEW GUINEA': 1, 'UNITED STATES': 1, 'ZIMBABWE': 1, 'GABON': 1, 'GIBRALTAR': 1, 'SWAZILAND': 1, 'VANUATU': 1, 'YEMEN': 1, 'ECUADOR': 1, 'UZBEKISTAN': 1, 'AUSTRALIA': 1, 'KUWAIT': 1, "C\U00F4TE D'IVOIRE": 1, 'FRANCE': 1, 'TRINIDAD AND TOBAGO': 1, 'ISLAMIC REP. OF IRAN': 1, 'SENEGAL': 1, 'SRI LANKA': 1, 'CROATIA': 1, 'TURKS AND CAICOS ISLANDS': 1, 'COMOROS': 1, 'TONGA': 1, 'NETHERLANDS': 1, 'HONDURAS': 1, 'LIBYA': 1, 'DOMINICAN REPUBLIC': 1, 'SYRIAN ARAB REPUBLIC': 1, 'VIET NAM': 1, 'MOZAMBIQUE': 1, 'SOUTH SUDAN': 1, 'COLOMBIA': 1, 'SWITZERLAND': 1, 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF': 1, 'CANADA': 1, 'JAMAICA': 1, 'EQUATORIAL GUINEA': 1, 'EGYPT': 1, 'CUBA': 1, 'LEBANON': 1, 'MONGOLIA': 1, 'BOTSWANA': 1, 'AUSTRIA': 1, 'CONGO': 1, 'MALI': 1, 'NEW ZEALAND': 1, 'ZAMBIA': 1, 'COOK ISLANDS': 1, 'PAKISTAN': 1, 'SEYCHELLES': 1, 'ANGOLA': 1, 'ARMENIA': 1, 'SAINT LUCIA': 1, 'SAINT KITTS AND NEVIS': 1, 'MALAYSIA': 1, 'SAINT VINCENT AND THE GRENADINES': 1, 'GHANA': 1, 'IRELAND': 1, 'RUSSIAN FEDERATION': 1, 'GRENADA': 1, 'NIGERIA': 1, 'HONG KONG': 1, 'KYRGYZSTAN': 1, 'BANGLADESH': 1, 'ESTONIA': 1, 'SLOVENIA': 1, 'ICELAND': 1, 'BRUNEI DARUSSALAM': 1, 'LESOTHO': 1, 'TUNISIA': 1, 'BRITISH VIRGIN ISLANDS': 1, 'BOSNIA AND HERZEGOVINA': 1, 'MONACO': 1, 'JAPAN': 1, 'UKRAINE': 1, 'STATELESS': 1, 'ISRAEL': 1, 'CHAD': 1, 'MEXICO': 1, 'TUVALU': 1, 'MOLDOVA, REPUBLIC OF': 1, 'LITHUANIA': 1, 'UNITED KINGDOM': 1, 'MOROCCO': 1, 'GEORGIA': 1, 'MACAO': 1, 'UGANDA': 1, 'THAILAND': 1, 'SIERRA LEONE': 1, 'BRAZIL': 1, 'MADAGASCAR': 1, 'ALBANIA': 1, 'CABO VERDE': 1, 'SOUTH AFRICA': 1, 'GERMANY': 1, 'NIGER': 1, 'NICARAGUA': 1, 'MALAWI': 1, 'NIUE': 1, 'AFGHANISTAN': 1, 'SAUDI ARABIA': 1, 'INDONESIA': 1, 'ITALY': 1, 'PERU': 1, 'PHILIPPINES': 1, 'VARIOUS': 1, 'SOMALIA': 1, 'ARGENTINA': 1, 'CYPRUS': 1, 'TANZANIA, UNITED REPUBLIC OF': 1, 'BAHRAIN': 1, 'MALDIVES': 1, 'WESTERN SAHARA': 1, 'TIBETANS': 1, 'CAYMAN ISLANDS': 1, 'MARSHALL ISLANDS': 1, 'LATVIA': 1, 'CHINA': 1, 'GUYANA': 1, 'BELGIUM': 1, 'GAMBIA': 1, 'KOREA, REPUBLIC OF': 1, 'BURKINA FASO': 1, 'LIBERIA': 1, 'KAZAKHSTAN': 1, 'MAURITIUS': 1, 'LIECHTENSTEIN': 1, 'MYANMAR': 1, 'NAMIBIA': 1, 'GREECE': 1, 'SLOVAKIA': 1, 'BELIZE': 1, 'FIJI': 1, 'ROMANIA': 1, 'BELARUS': 1, 'CZECH REPUBLIC': 1, 'EL SALVADOR': 1, 'POLAND': 1, 'INDIA': 1, 'LUXEMBOURG': 1, "LAO PEOPLE'S DEMOCRATIC REPUBLIC": 1, 'SOLOMON ISLANDS': 1, 'SERBIA': 1, 'HUNGARY': 1, 'SPAIN': 1, 'CONGO, THE DEMOCRATIC REPUBLIC OF THE': 1, 'MAURITANIA': 1, 'UNITED ARAB EMIRATES': 1, 'FINLAND': 1, 'MALTA': 1, 'ANDORRA': 1, 'DJIBOUTI': 1, 'JORDAN': 1, 'SINT MAARTEN (DUTCH PART)': 1, 'KENYA': 1, 'PARAGUAY': 1, 'STATE OF PALESTINE': 1, 'DOMINICA': 1, 'TURKEY': 1, 'SAO TOME AND PRINCIPE': 1, 'SAMOA': 1, 'TURKMENISTAN': 1, 'BHUTAN': 1, 'URUGUAY': 1, 'GUINEA': 1, 'PANAMA': 1, 'SINGAPORE': 1, 'SAN MARINO': 1, 'CENTRAL AFRICAN REPUBLIC': 1, 'GUATEMALA': 1, 'CHILE': 1, 'BURUNDI': 1, 'HAITI': 1, 'CAMEROON': 1, 'BULGARIA': 1}};
	var pageRank = pgRank.year;
	var degCen_In = {"year": {'ERITREA': 1, 'MONTENEGRO': 2, 'TOGO': 2, 'GUINEA-BISSAU': 1, 'VENEZUELA, BOLIVARIAN REPUBLIC OF': 1, 'YEMEN': 4, 'ALGERIA': 2, 'TAJIKISTAN': 1, 'COSTA RICA': 1, 'ETHIOPIA': 5, 'SWEDEN': 11, 'RWANDA': 1, 'NORWAY': 10, 'SUDAN': 3, 'DENMARK': 5, 'NEPAL': 2, 'PAPUA NEW GUINEA': 1, 'UNITED STATES': 45, 'ZIMBABWE': 1, 'IRAQ': 4, 'ECUADOR': 1, 'AUSTRALIA': 8, 'GAMBIA': 1, "C\U00F4TE D'IVOIRE": 1, 'FRANCE': 33, 'ARMENIA': 1, 'AUSTRIA': 8, 'NETHERLANDS': 11, 'LIBYA': 3, 'SOUTH AFRICA': 8, 'SYRIAN ARAB REPUBLIC': 3, 'MOZAMBIQUE': 1, 'SOUTH SUDAN': 4, 'SWITZERLAND': 14, 'CANADA': 32, 'MAURITANIA': 1, 'EGYPT': 7, 'LEBANON': 2, 'SENEGAL': 1, 'CONGO': 3, 'MALI': 2, 'PAKISTAN': 1, 'ANGOLA': 1, 'IRAN, ISLAMIC REPUBLIC OF': 2, 'ZAMBIA': 4, 'MALAYSIA': 2, 'RUSSIAN FEDERATION': 2, 'BANGLADESH': 1, 'BOSNIA AND HERZEGOVINA': 1, 'KENYA': 7, 'UKRAINE': 1, 'CHAD': 2, 'UNITED KINGDOM': 18, 'UGANDA': 8, 'THAILAND': 1, 'SIERRA LEONE': 1, 'BRAZIL': 2, 'GERMANY': 20, 'NIGER': 2, 'MALAWI': 3, 'TURKEY': 5, 'INDONESIA': 1, 'ITALY': 17, 'SOMALIA': 1, 'CYPRUS': 1, 'TANZANIA, UNITED REPUBLIC OF': 3, 'CHINA': 1, 'BELGIUM': 6, 'BURKINA FASO': 1, 'LIBERIA': 1, 'NAMIBIA': 1, 'GREECE': 1, 'CENTRAL AFRICAN REP.': 2, 'POLAND': 1, 'INDIA': 4, 'LUXEMBOURG': 1, 'SERBIA': 2, 'CONGO, THE DEMOCRATIC REPUBLIC OF THE': 5, 'FINLAND': 3, 'MALTA': 2, 'DJIBOUTI': 1, 'JORDAN': 2, 'JAPAN': 1, 'GHANA': 3, 'GUINEA': 2, 'PANAMA': 1, 'BURUNDI': 1, 'CAMEROON': 3, 'BULGARIA': 2}};
	var Deg_In = degCen_In.year;
	var degCen_Out = {"year": {'RWANDA': 8, 'LIBERIA': 6, 'GEORGIA': 1, 'HONDURAS': 1, 'UGANDA': 2, 'CHAD': 3, 'STATELESS': 4, 'INDIA': 2, 'INDONESIA': 2, 'VIET NAM': 4, 'UZBEKISTAN': 2, 'TOGO': 4, 'ERITREA': 17, 'SOUTH SUDAN': 3, 'COLOMBIA': 7, 'CROATIA': 2, 'MAURITANIA': 4, 'VENEZUELA, BOLIVARIAN REPUBLIC OF': 1, 'ALBANIA': 4, 'ALGERIA': 1, 'EL SALVADOR': 2, 'PAKISTAN': 6, 'MEXICO': 2, 'LEBANON': 1, 'SENEGAL': 2, 'CAMBODIA': 1, "LAO PEOPLE'S DEMOCRATIC REPUBLIC": 1, 'ETHIOPIA': 13, 'SERBIA': 8, 'CONGO': 3, 'PERU': 1, 'MALI': 6, 'MYANMAR': 6, 'BELARUS': 1, 'UKRAINE': 2, 'AFGHANISTAN': 24, 'SYRIAN ARAB REPUBLIC': 19, 'ANGOLA': 3, 'CONGO, THE DEMOCRATIC REPUBLIC OF THE': 20, 'CUBA': 1, 'SUDAN': 14, 'NEPAL': 2, 'AZERBAIJAN': 4, 'UNITED STATES': 1, 'SRI LANKA': 9, 'ZIMBABWE': 4, 'VARIOUS': 8, 'GHANA': 2, 'KENYA': 4, 'RUSSIAN FEDERATION': 10, 'NIGERIA': 5, 'IRAQ': 25, 'STATE OF PALESTINE': 5, 'TURKEY': 8, 'BHUTAN': 1, 'BANGLADESH': 5, 'WESTERN SAHARA': 1, 'MOLDOVA, REPUBLIC OF': 1, 'GUINEA': 3, "C\U00F4TE D'IVOIRE": 8, 'ARMENIA': 3, 'EGYPT': 2, 'GUATEMALA': 1, 'CHINA': 9, 'BOSNIA AND HERZEGOVINA': 5, 'IRAN, ISLAMIC REPUBLIC OF': 15, 'GAMBIA': 1, 'BURUNDI': 10, 'SAINT VINCENT AND THE GRENADINES': 1, 'HAITI': 3, 'CENTRAL AFRICAN REPUBLIC': 5, 'CAMEROON': 1, 'TIBETANS': 1, 'SOMALIA': 25}};
	var Deg_Out = degCen_Out.year;
	var LCC = {"year": {'UKRAINE': 0.5, 'LIBERIA': 0.2, 'CHAD': 0.166, 'PAKISTAN': 0.033, 'SYRIAN ARAB REPUBLIC': 0.0935, 'VIET NAM': 0.25, 'TOGO': 0.0833, 'ERITREA': 0.099265, 'SOUTH SUDAN': 0.5, 'COLOMBIA': 0.04762, 'MAURITANIA': 0.1667, 'ALBANIA': 0.0833, 'EL SALVADOR': 0.5, 'MEXICO': 0.5, 'INDIA': 0.5, 'CROATIA': 0.5, 'ETHIOPIA': 0.141026, 'RWANDA': 0.17857, 'MALI': 0.0667, 'AFGHANISTAN': 0.09964, 'CONGO, THE DEMOCRATIC REPUBLIC OF THE': 0.071053, 'SUDAN': 0.142857, 'NEPAL': 0.5, 'AZERBAIJAN': 0.16667, 'SRI LANKA': 0.04167, 'ZIMBABWE': 0.0833, 'GHANA': 0.5, 'RUSSIAN FEDERATION': 0.01112, 'IRAQ': 0.07, 'STATE OF PALESTINE': 0.1, 'TURKEY': 0.125, 'BANGLADESH': 0.05, 'MYANMAR': 0.0667, "C\U00F4TE D'IVOIRE": 0.25, 'CENTRAL AFRICAN REPUBLIC': 0.15, 'CHINA': 0.04167, 'BOSNIA AND HERZEGOVINA': 0.2, 'IRAN, ISLAMIC REPUBLIC OF': 0.1095, 'BURUNDI': 0.1111, 'KENYA': 0.3333, 'HAITI': 0.1667, 'SOMALIA': 0.085}};
	var lcc = LCC.year;
	// var degCen = {"year": };	// make list
	// var Deg = degCen.year;
	// workING! testing[countryName]
	// cant do year - cannot find the controlling variable
	// var importExportText = "";
	// if(country.exportedAmount > 0 && country.importedAmount > 0) {
	//    importExportText += "imported:&nbsp;" + numberWithCommas(country.importedAmount) + " Refugees" + "<br />" +
	//        "exported:&nbsp;"+numberWithCommas(country.exportedAmount) + " Refugees" + "<br />" +
	//        "centrality:&nbsp;" + testing[countryName] ;
	// } else if(country.exportedAmount > 0 && country.importedAmount == 0) {
	//    importExportText += "exported:&nbsp;"+numberWithCommas(country.exportedAmount) + " Refugees" +"<br />&nbsp;";
	// } else if(country.exportedAmount == 0 && country.importedAmount > 0) {
	//    importExportText += "imported:&nbsp;"+numberWithCommas(country.importedAmount) + " Refugees" +"<br />&nbsp;";
	// }
	// var importExportText = "";
	// if(country.exportedAmount > 0 && country.importedAmount > 0) {
	//    importExportText += "imported:&nbsp;" + numberWithCommas(country.importedAmount) + " Refugees" + "<br />" +
	//        "exported:&nbsp;"+numberWithCommas(country.exportedAmount) + " Refugees" + "<br />" +
	//        "Betweenness-centrality:&nbsp;" + testing[countryName] ;
	// } else if(country.exportedAmount > 0 && country.importedAmount == 0) {
	//    importExportText += "exported:&nbsp;"+numberWithCommas(country.exportedAmount) + " Refugees" +"<br />&nbsp;";
	// } else if(country.exportedAmount == 0 && country.importedAmount > 0) {
	//    importExportText += "imported:&nbsp;"+numberWithCommas(country.importedAmount) + " Refugees" +"<br />&nbsp;";
	// }
	var importExportText = "";
	// if(Deg[countryName] > 0) {
	//    DegCen = "DegCen: " + Deg[countryName] + "<br />";
	// }
	// else{
	// 	DegCen = ""
	// }
	if(Deg_In[countryName] > 0) {
	   DegCenIn = "In Neighbors: " + Deg_In[countryName] + "<br />";
	}
	else{
		DegCenIn = ""
	}
	if(Deg_Out[countryName] > 0) {
	   DegCenOut = "Out Neighbors: " + Deg_Out[countryName] + "<br />";
	}
	else{
		DegCenOut = ""
	}
	if(btw[countryName] > 0) {
	   BetweennessCen = "BetweennessCen: " + btw[countryName] + "<br />";
	}
	else{
		BetweennessCen = ""
	}
	// if(eig[countryName] >0) {
	// 	EigenvectorCen = "EigenvectorCen: " + eig[countryName] + "<br />";
	// }
	// else{
	// 	EigenvectorCen = ""
	// }
	// if (katz[countryName] >0){
	// 	KatzCen = "KatzCen: " + katz[countryName] +"<br />";
	// }
	// else{
	// 	KatzCen = ""
	// }
	if(pageRank[countryName] >0){
		PgRank = "PageRank: " + pageRank[countryName] + "<br />";
	}
	else{
		PgRank = ""
	}
	if(lcc[countryName] >0){
		Lcc = "LCC: " + lcc[countryName] + "<br />";
	}
	else{
		Lcc = ""
	}
	// importExportText += DegCen+ DegCenIn + DegCenOut + BetweennessCen + EigenvectorCen + KatzCen + PgRank;
	importExportText += DegCenOut + DegCenIn + BetweennessCen + PgRank + Lcc;

	marker.importExportText = importExportText;


	var markerOver = function(e){
		this.detailLayer.innerHTML = importExportText;
		this.hover = true;
	}

	var markerOut = function(e){
		this.detailLayer.innerHTML = "";
		this.hover = false;
	}

	if( !tiny ) {		
		detailLayer.innerHTML = importExportText;
	}
	else{
		marker.addEventListener( 'mouseover', markerOver, false );
		marker.addEventListener( 'mouseout', markerOut, false );
	}


	var markerSelect = function(e){
		var selection = selectionData;
		selectVisualization( timeBins, selection.selectedYear, [this.countryName], selection.getExportCategories(), selection.getImportCategories() );	
	};
	marker.addEventListener('click', markerSelect, true);

	markers.push( marker );
}		

function removeMarkerFromCountry( countryName ){
	countryName = countryName.toUpperCase();
	var country = countryData[countryName];
	if( country === undefined )
		return;
	if( country.marker === undefined )
		return;

	var index = markers.indexOf(country.marker);
	if( index >= 0 )
		markers.splice( index, 1 );
	var container = document.getElementById( 'visualization' );		
	container.removeChild( country.marker );
	country.marker = undefined;		
}