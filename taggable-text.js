(function ($) {

    $.fn.taggableText = function (ajaxUrl) {
        $(this).each(function () {
        	var current = {
        		ajax: null,
        		ajaxUrl: ajaxUrl,
        		dropdown: $('<ul class="' + $.fn.taggableText.dropdownClasses.ul + '" style="display: block;" role="menu"></ul>'),
        		field: $(this)
    		}

        	current.field.focus(function(){
        		current.field.addClass('taggable-text-active');
        	});
        	current.field.blur(function(){
        		current.field.removeClass('taggable-text-active');
        		setTimeout(function(){
        			current.dropdown.detach();
    			}, 100);
        	});
        	var upDownKeys = true;
        	current.field.keydown(function(event){
        		var key = event.which;
        		upDownKeys = true;
        		if(key != 38 && key != 40 && key != 13 && key != 9) return;
        		if(current.dropdown.closest('body').size() > 0){
        			upDownKeys = false;

        			// special keys pressed management
        			switch(key){
        				// up
        				case 38:
        					var liSel = 'li', aSel = 'a', notSel = '';
        					if($.fn.taggableText.dropdownClasses.liSelected != '') liSel += '.' + $.fn.taggableText.dropdownClasses.liSelected;
        					if($.fn.taggableText.dropdownClasses.aSelected != '') aSel += '.' + $.fn.taggableText.dropdownClasses.aSelected;
        					
        					var a = current.dropdown.find(liSel + ' ' + aSel).removeClass($.fn.taggableText.dropdownClasses.aSelected);

                            liSel = 'li';
                            aSel = 'a';
                            if($.fn.taggableText.dropdownClasses.li != '') liSel += '.' + $.fn.taggableText.dropdownClasses.li;
                            if($.fn.taggableText.dropdownClasses.a != '') aSel += '.' + $.fn.taggableText.dropdownClasses.a;
                            if($.fn.taggableText.dropdownClasses.liIgnore != '') notSel += ':not(.' + $.fn.taggableText.dropdownClasses.liIgnore + ')';

        					if(a.size() == 0) a = current.dropdown.find(liSel + notSel + ' ' + aSel).first();

        					var li = a.parent().removeClass($.fn.taggableText.dropdownClasses.liSelected);
        					li = li.prevOrLast(liSel + notSel).addClass($.fn.taggableText.dropdownClasses.liSelected);
        					li.find(aSel).addClass($.fn.taggableText.dropdownClasses.aSelected);
        					break;
        				// down
        				case 40:
                            var liSel = 'li', aSel = 'a', notSel = '';
                            if($.fn.taggableText.dropdownClasses.liSelected != '') liSel += '.' + $.fn.taggableText.dropdownClasses.liSelected;
                            if($.fn.taggableText.dropdownClasses.aSelected != '') aSel += '.' + $.fn.taggableText.dropdownClasses.aSelected;
                            
                            var a = current.dropdown.find(liSel + ' ' + aSel).removeClass($.fn.taggableText.dropdownClasses.aSelected);

                            liSel = 'li';
                            aSel = 'a';
                            if($.fn.taggableText.dropdownClasses.li != '') liSel += '.' + $.fn.taggableText.dropdownClasses.li;
                            if($.fn.taggableText.dropdownClasses.a != '') aSel += '.' + $.fn.taggableText.dropdownClasses.a;
                            if($.fn.taggableText.dropdownClasses.liIgnore != '') notSel += ':not(.' + $.fn.taggableText.dropdownClasses.liIgnore + ')';

                            if(a.size() == 0) a = current.dropdown.find(liSel + notSel + ' ' + aSel).last();

                            var li = a.parent().removeClass($.fn.taggableText.dropdownClasses.liSelected);
                            li = li.nextOrFirst(liSel + notSel).addClass($.fn.taggableText.dropdownClasses.liSelected);
                            li.find(aSel).addClass($.fn.taggableText.dropdownClasses.aSelected);
                            break;
        				// return or tab
        				case 13:
        				case 9:
        					var sel = 'li';
							if($.fn.taggableText.dropdownClasses.liSelected != '') sel += '.' + $.fn.taggableText.dropdownClasses.liSelected;
							
							sel += ' a';
							if($.fn.taggableText.dropdownClasses.aSelected != '') sel += '.' + $.fn.taggableText.dropdownClasses.aSelected;
			        		
			        		$(sel).click();
        					break;
        			}

        			return false;
    			}
        	});
			var snailPosition = -1, nextSpacePosition = -1;
        	current.field.keyup(function(event){
        		if(!upDownKeys) return;
        		var value = current.field.val();
        		var caretPosition = doGetCaretPosition(current.field[0]);
        		snailPosition = value.lastIndexOf('@', caretPosition);
        		var spacePosition = value.lastIndexOf(' ', caretPosition - 1);

        		if(snailPosition <= spacePosition){
        			current.dropdown.detach();
        			return;
        		}

        		if(current.ajax && current.ajax != null && current.ajax.readystate != 4){
		            current.ajax.abort();
		        }

        		nextSpacePosition = value.indexOf(' ', caretPosition);
        		if(nextSpacePosition < 0) nextSpacePosition = value.length;
        		if(nextSpacePosition - snailPosition < 2){ // at least one character length to start searching
        			current.dropdown.detach();
        			return;
        		}

        		var query = value.substring(snailPosition + 1, nextSpacePosition);

        		current.ajax = $.ajax({
        			url: current.ajaxUrl + '/' + query,
        			dataType: 'json',
        			success: function(tags){
        				if(!current.field.hasClass('taggable-text-active')) return;
        				if(tags.length == 0){
        					current.dropdown.detach();
        					return;
        				}

    					current.dropdown.empty();
        				if(current.dropdown.closest('body').size() == 0){
        					current.dropdown.css({
        						'position': 'absolute',
        						'left': current.field.offset().left + 'px',
        						'top': (current.field.offset().top + current.field.outerHeight() - 4) + 'px',
        						'width': current.field.outerWidth() + 'px'
        					});
        					$('body').append(current.dropdown);
		        		}

        				var i;
        				for(i in tags){
        					current.dropdown.append('<li role="presentation" class="' + $.fn.taggableText.dropdownClasses.li + '"><a role="menuitem" tabindex="-1" href="#" class="' + $.fn.taggableText.dropdownClasses.li + '">' + tags[i].name + '</a></li>');
        				}
                        for(i in $.fn.taggableText.additional.items){
                            var toInsert = $($.fn.taggableText.additional.items[i]);
                            if($.fn.taggableText.additional.onSelect[i])
                                toInsert.find('a').click(function(){ $.fn.taggableText.additional.onSelect[i]($(this), current.field, snailPosition); });
                            current.dropdown.append(toInsert);
                        }
        				current.dropdown.find('li a').first().addClass($.fn.taggableText.dropdownClasses.aSelected).parent().addClass($.fn.taggableText.dropdownClasses.liSelected);
        			}
    			});
        	});
        	current.field.click(function(){
        		upDownKeys = true;
        		current.field.keyup();
        	});


        	current.dropdown.on('click', 'a', function(){
        		var name = $(this).html();
        		current.dropdown.detach();
                current.field.focus();

        		var value = current.field.val();

                var toEnd = value.length - nextSpacePosition;

        		current.field.val(value.substring(0, snailPosition) + name + value.substring(nextSpacePosition, value.length));
                doSetCaretPosition(current.field[0], current.field.val().length - toEnd);

        		return false;
        	});
        });
    };

	$.fn.taggableText.dropdownClasses = {
		ul: 'dropdown-menu',
		li: '',
		a: '',
		liSelected: '',						// must be specified at
		aSelected: 'dropdown-item-selected',// least one of these two
        liIgnore: 'divider'
	};

    $.fn.taggableText.additional = {
        items: [],      // additional elements (to be used must contain an 'a')
        onSelect: []    // additional elements select handler functions (set htm as the value to return) => function(clickedA, currentField, caretPosition)
    };

    // js field, not jquery
	function doGetCaretPosition (oField) {
		// Initialize
		var iCaretPos = 0;
		// IE Support
		if (document.selection) {
			// Set focus on the element
			oField.focus ();
			// To get cursor position, get empty selection range
			var oSel = document.selection.createRange ();
			// Move selection start to 0 position
			oSel.moveStart ('character', -oField.value.length);
			// The caret position is selection length
			iCaretPos = oSel.text.length;
		}
		// Firefox support
		else if (oField.selectionStart || oField.selectionStart == '0')
		iCaretPos = oField.selectionStart;

		// Return results
		return (iCaretPos);
	}
    // js field, not jquery
    function doSetCaretPosition(ctrl, pos){
        if(ctrl.setSelectionRange)
        {
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
        }
        else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }


	$.fn.nextOrFirst = function(selector){
		var next = this.next(selector);
		return (next.length) ? next : this.parent().children(selector).first();
	};

	$.fn.prevOrLast = function(selector){
		var prev = this.prev(selector);
		return (prev.length) ? prev : this.parent().children(selector).last();
	};

    $.fn.setCaretPosition = function(position){
        this.focus();
        doSetCaretPosition(this[0], position);
    };

})(jQuery);