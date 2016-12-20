var DaPgroupManagement = MessageBotExtension("DaPgroupManagement");
(function(ex){
	ex.setAutoLaunch(true);
	
	ex.createTab = function(){
		ex.tab = ex.ui.addTab("GROUP MANAGEMENT");
		var style = "<style>#"+ex.id+"_tab nav span{width:100%; background-color:#0e1c90; color:white;} #"+ex.id+"_tab nav {width:100%;}</style>";
		ex.tab.innerHTML = style + "<div id='"+ex.id+"_tab'><nav><span>Group 1</span></nav></div>";
	};

	ex.createTab();
})(DaPgroupManagement);
