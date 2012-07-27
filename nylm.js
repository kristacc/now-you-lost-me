var notify;
var content_hash;
var post_id;
var user_id;

// Removes whitespaces from beginning and end of string.
if(typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
		};
	}


// Generates random key
function generate_key(){
	var millis = (new Date()).getTime();
	var rnd = Math.round(Math.random()*9999);
	return (millis*10000 + rnd).toString(16);
	}

// Saves the button state (== is it pressed or not) to server
function _save_state( paragraph, operation ){
	var params = {
		post: post_id,
		user: user_id,
		paragraph: paragraph,
		operation: operation,
		content: content_hash
		};
	
	$.post( "/nylm", params, function( response ){ /*console.log("state: response ->", response);*/ } );
	
	}
	
// Transfers the information on the background == user will not be affected by this (a lot).
function save_state( paragraph, operation ){
	setTimeout( function(){ _save_state( paragraph, operation ); },0); 
	}


// Saves comment to server
function _save_comment( paragraph, text ){
	var params = {
		post: post_id,
		user: user_id,
		paragraph: paragraph,
		content: content_hash,
		comment: text
		};

	$.post( "/nylm", params, function( response ){ /*console.log("comment: response ->", response);*/ } );
	}

// Transfers the information on the background == user will not be affected by this (a lot).
function save_comment( paragraph, text ){
	setTimeout( function(){ _save_comment( paragraph, text ); }, 0);
	}

// Posts "I read this" message to server.
function _save_read(){
	var params = {
		post: post_id,
		user: user_id,
		content: content_hash,
		read: true
		};

	$.post( "/nylm", params, function( response ){ /*console.log("comment: response ->", response);*/ } );
	}

// Transfers the information on the background == user will not be affected by this (a lot).
function save_read(){
	setTimeout( function(){ _save_read(); }, 0);
	}

// Adds buttons to each paragraph.
function init_nylm( id ){
	$('.'+id +" p").each(function( index ){
		
		if( $(this).text().trim().length < 1 ){ return; }
		
		$(this).data( "nylm-id", "" + index );
		
		var elem = document.createElement( "span" );
		var link = document.createElement( "a" );
		var comment = document.createElement( "a" );
		var bubble = document.createElement( "img" );
		var comment_text = document.createElement( "textarea" );
		
		var comment_box = document.createElement( "div" );
		var link_save = document.createElement( "a" );
		
		$(link_save).html("&nbsp;&nbsp;Send&nbsp;&nbsp;");
		link_save.setAttribute( "href", "#" );
		comment_box.setAttribute( "class", "comment-text" );
		
		bubble.setAttribute( "src", "/img/small-bubble.png" );
		comment.appendChild( bubble );
		comment.setAttribute( "class", "comment" );
		
		comment_text.setAttribute( "rows", "5" );
		comment_text.setAttribute( "cols", "70" );
		
		comment_box.setAttribute( "id", "nylm-text-" + index );
		comment_box.appendChild( comment_text );
		comment_box.appendChild( link_save );
		
		
		
		var substring_len = 100;
		var snippet = $(this).text().substring( 0, substring_len ).trim() + "...";
		
		$(link).data( "snippet", snippet );
		$(link).data( "toggle", "0" );
		
		link.setAttribute( "href", "#" );
		$(link).html( "Now you lost me!");
		
		elem.appendChild( link );
		
		elem.appendChild( comment );
		$(this).after( comment_box );
		
		elem.setAttribute( "class", "nylm-link" );
		$(this).append( elem );
		$(link).on("click", function(e){
			
			
			$(this).text( "Now you lost me!" );
			
			var toggle = $(this).data("toggle");
			if( toggle == "0" ){
				$(this).data("toggle", "1");
				$(comment).css({visibility: "visible"});
				save_state( index, "incr" );
				
				$(link).addClass( "is-pinned-down" );
				
				}
			else{
				$(this).data("toggle", "0");
				$(comment).css({visibility: "hidden"});
				save_state( index, "decr" );
				$("#nylm-text-" + index ).css({display: "none"});
				$(link).removeClass( "is-pinned-down" );
				}
			
			return false;
			});
		
		$(bubble).on("click", function(e){
			if( $("#nylm-text-" + index ).css("display") == "none" ){
				$("#nylm-text-" + index ).css({display: "block" });
				}
			else{
				$("#nylm-text-" + index ).css({display: "none"});
				}
			
			});
		
		$("#nylm-text-" + index + " a").on("click", function(e){
			
			
			notify.log( "Comment sent. " );
			save_comment( index, $("#nylm-text-" + index + " textarea").val() );
			
			setTimeout( function(){$("#nylm-text-" + index ).css({display: "none"});}, 200 );
		
			return false;
			});
		
		$(this).find( ".nylm-link").css({ visibility: "hidden" });
		$(comment).css({visibility: "hidden"});
		$("#nylm-text-" + index ).css({display: "none"});
				
		
		$(link).on("mouseover", function(e){
			if( $(this).data("toggle") == "1" ){
				$(this).html( "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;No, all ok&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" );
				}
			});		
		
		$(link).on("mouseout", function(e){
			if( $(this).data("toggle") == "1" ){
				$(this).text( "Now you lost me!" );
				}
			});		
			
		
		
		$(this).on("mouseover", function(e){
			$(this).find( ".nylm-link").css({ visibility: "visible" });
			$(this).find( ".nylm-link").on( "mouseover", function(e){
				$(this).css({ visibility: "visible" });
				});
			});
		
		
		$(this).on("mouseout", function(e){
			if( $(this).find( ".nylm-link" ).find( "a" ).data( "toggle" ) == "0" ){
				$(this).find( ".nylm-link").css({ visibility: "hidden" });
				}
			});
		
		
		} );
	
	
	
	}


// Here we take humane.js and nylm to use. This sort of initialization has to be done...
$(document).ready(function(){
	
	notify = humane.create( { timeout: 2500, baseCls: 'humane-bigbox' } );
	
	console.log( "user-id", localStorage.getItem( "kristacc:user" ) );
	user_id = localStorage.getItem( "kristacc:user" );
	
	if( user_id == null ){
		user_id = generate_key();
		localStorage.setItem( "kristacc:user", user_id );
		}
	
	post_id = $("body").data("post-id");
	content_hash = $("body").data("content-hash");
	
	console.log( "post-id", post_id );
	console.log( "content-hash", content_hash );
	
	init_nylm( "text" );
	
	var finished_div = document.createElement( "div" );
	var finished_link = document.createElement( "a" );
	
	finished_div.setAttribute( "class", "finished" );
	finished_link.setAttribute( "href", "#" );
	finished_div.appendChild( finished_link );
	
	$(finished_link).text( " I read this through! :) " );
	
	$('.nav-links').before( finished_div );
	
	$(finished_link).on( "click", function( e ){
		$(finished_div).text( "Thanks for letting me know! <3");
		save_read();
		return false;
		});
	
	});


