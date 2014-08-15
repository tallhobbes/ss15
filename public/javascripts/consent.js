// consent client side script
// handle consent form schtuff


$(document).ready(function() {	

	var activateEdit = function() {

	$('.edit-link').mouseenter(function() {
		if (!$(this).hasClass('editing')) {
			$(this).append(' Edit?');
		}
		$(this).mouseleave(function() {
			if (!$(this).hasClass('editing')) {
				$(this).html('<i class="icon icon-edit"></i>');
			}
		});
	})}

	var activateAdd = function() {
		//ADD NAMES BUTTON
		$('btn.consent-add').popover({trigger: 'click', html: true, placement: 'bottom', callback: popoverDismiss()});
	}


	var setConsentDiv = function(name) {
		// Render current class' roster/survey
		$('#title-class').fadeOut('fast', function() {
			$(this).html(
				'<h2 class="span12 text-center"> ' + 
				name +
				'</h2>').fadeIn('fast');
			});
		// now need to get name to edit view partial
		$.get('/consent/edit', {name: name}, function(data) {
			if(data.err) { console.log("Unable to load all classes.") }
			else {
				$("#title-class").fadeOut("fast", function() {
					$(this).html(data).fadeIn("fast", function() {
						//activateEdit();
						activateAdd();
						activateConsentAdd();
					})
				})
			}
		});
	}



	var editConsent = function(){
		$('.edit-consent').click(function(){
			console.log('got click');
			console.log('i am ', $(this).attr('name'));
			setConsentDiv($(this).attr('name'));
		})
	};
	editConsent();

	// handle popover dismissal
	var popoverDismiss = function() {
		$('body').click('on', function(e) { $('.popper').each(function() {
				if(!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
					$(this).popover('hide');
				}
			})
		})
	}


  // NEW CLASS BUTTON
	// initialize new-class popover
	$('.btn-new').popover({trigger: 'click', html: true, placement: 'right', callback: popoverDismiss()});

	// name new class
	$('.btn-new').click(function() {
		$('.btn-enter').click(function() {
			$('div.alert').remove();
			var className = $('.class-name').val();
			console.log(className);
			if (className.length > 0) {
				$.post('/class/create', {name: className}, function(res) {
					if (res.err) { console.log("Unable to create new class."); return false}
					else {
						if (res.success) {
							// Do success stuff here (render partials, initialize new elements' jquery)
							// Updates list of classes on left (I think.. :)
							$.get('/consent/cites', function(data) {
								if(data.err) { console.log("Unable to load all classes.") }
								else {
									$("#classList").fadeOut("fast", function() {
										$(this).html(data).fadeIn("fast", function() {
											// does this really just modify the last one?
											$('tr:last td a.edit-link').append(" Editing").toggleClass("editing");
											$('tr:last td:first').toggleClass("editing");
											// guess need to call this since new data was loaded? Makes buttons work
											activateEdit();
										})
									})
								}
							});
							// Updates stuff on right by calling setClassDiv method - above could be similarly separated out 
							setConsentDiv(className);
							activateAdd();
							activateRosterEdit();
							// Close popover?
							$('.btn-new').popover("toggle");
						}
						else {
							$('div.name-div').append("<div class='alert margin'>"+
													"<button type='button' class='close' data-dismiss='alert'>&times;"+
													"</button><strong>Oops! </strong>"+
													res.message+
													"</div>")
						}
					}
				});
			}
			else {
				$('div.name-div').append("<div class='alert margin'>"+
										"<button type='button' class='close' data-dismiss='alert'>&times;"+
										"</button><strong>Oops! </strong>"+
										"You need to enter a name!</div>");
			}
		});
	});


	//ADD NAMES BUTTON
	$('btn.consent-add').popover({trigger: 'click', html: true, placement: 'bottom', callback: popoverDismiss()});
	activateAdd();

	//Import text and send to consents adder
	var activateConsentAdd = function() {
		//rosterSearch();
		$('.consent-add').click(function() {
			//activateImport();
			$('.btn-text-consent').click(function() {
				$('.alert').remove();
				var csvRoster = $('textarea').val();
				console.log('input text is: ', csvRoster);
				if (csvRoster.length === 0) {
					$('div.roster-add').append("<div class='alert margin'>"+
											"<button type='button' class='close' data-dismiss='alert'>&times;"+
											"</button><strong>Oops! </strong>"+
											"You didn't enter anything!</div>");
				}
				else {
					var rosterAdd = csvRoster.split(", ");
					var className = $('.text-center').html();
					console.log("classname", className);
					$.post('/consent/add', {rAdd: rosterAdd, name: className}, function(res) {
						if(res.err) { console.log("Error posting roster"); return false}
						else {
							if(res.success) {
								console.log("Success!");
								// Add get that renders roster
								setClassDiv($("a.editing").attr("name"));
								$('.roster-add').popover("toggle");
							}
						}
					})
				}
			});
		});
	}
	activateConsentAdd();
});

