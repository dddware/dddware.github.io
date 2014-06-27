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

	// Fuck this shit
	var jumpers = document.querySelectorAll('.jumper')
	  , sections = document.querySelectorAll('section')

	  , attributeHeights = function () {
	  	  [].forEach.call(sections, function (el) {
	  	  	el.style.display = 'block';
	  	  });

	  		[].forEach.call(jumpers, function (el) {
	  			var cssHeight = el.style.height;
	  			el.style.height = 'auto';
					el.setAttribute('data-height', el.offsetHeight + 'px');
					el.style.height = cssHeight;
				});

	  	  [].forEach.call(sections, function (el) {
	  	  	el.removeAttribute('style');
	  	  });
	    };

	[].forEach.call(jumpers, function (el) {
		el.addEventListener('mouseover', function () {
			el.style.height = el.getAttribute('data-height');
		});

		el.addEventListener('mouseout', function () {
			el.removeAttribute('style');
		});
	});

	window.onresize = function() { attributeHeights(); };
	attributeHeights();
});