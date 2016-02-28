$(function() {

	var socket = io();

	socket.on('positionChange', function(info){
		if(info.nextId) $('#'+info.nextId).before($('#'+info.id));
		else $('#'+info.id).appendTo("#sortable");
	});

	socket.on('currentAds', function(ads){
		ads.forEach(function(item){
			$(item).appendTo("#sortable").hide().show('bounce');
		});
	});

	socket.on('newAds', function(ads){
		ads.forEach(function(item){
			$(item).appendTo("#sortable").hide().show('bounce');
		});
	});

	$("#sortable").sortable({

		stop: function(event, ui){
			var ids = [];
			var id = $(ui.item).attr('id');
			$("#sortable li").each(function(){
				ids.push($(this).attr('id'));
			});

			var newIndex = ids.indexOf(id);

			socket.emit('positionChange', { id: id, newIndex: newIndex, nextId: newIndex < ids.length-1 ? ids[newIndex+1] : undefined });
		}
	});
	$("#sortable").disableSelection();


	$("#button1").click(function(){
		$('<li id="3" class="draggable"><div class="extra_img-b"><a href="https://www.chotot.vn/quan-12/mua-ban-nha-dat/nha-shr-4x22-lung-3pn-hem-4m-1-sec-duong-ta16--21572837.htm"><img alt="Mua bán Nhà SHR. 4x22. Lửng 3PN. Hẻm 4m 1 sẹc đường TA16. tại Tp Hồ Chí Minh" src="//static.chotot.com.vn/listing_thumbs/58/nha-dat-nha-shr-4x22-lung-3pn-hem-4m-1-sec-duong-ta16--5808675654.jpg" title="Mua bán Nhà SHR. 4x22. Lửng 3PN. Hẻm 4m 1 sẹc đường TA16. tại Tp Hồ Chí Minh"></a></div></li>')
			.appendTo("#sortable").hide().show('bounce');
	});


});

