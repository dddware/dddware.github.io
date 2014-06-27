document.addEventListener('DOMContentLoaded', function(){
	var nav = document.querySelectorAll('nav a');
	var pages = document.querySelectorAll('section');

	[].forEach.call(nav, function(el) {
	  el.addEventListener('click', function() {
	  	[].forEach.call(nav, function(el) {
	  		el.classList.remove('active');
	  	});
	  	[].forEach.call(pages, function(el) {
	  		el.classList.remove('active');
	  	});

			el.classList.add('active');
			(document.querySelector(el.hash)).classList.add('active')
	  })
	});

});