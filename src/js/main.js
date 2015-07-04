'use strict';

// FB SDK.
window.fbAsyncInit = function() {
	FB.init({
		appId      : fbAppId,
		xfbml      : false, // No share buttons etc.
		version    : 'v2.3',
		status     : true // Logs in at once.
	});

	// My own app. Initializes *after* FB.
	var app = new App();
};
(function(d, s, id){
	 var js, fjs = d.getElementsByTagName(s)[0];
	 if (d.getElementById(id)) {return;}
	 js = d.createElement(s); js.id = id;
	 js.src = "//connect.facebook.net/sv_SE/sdk.js";
	 fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
