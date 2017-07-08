/**
 * Created by Racchanak on 3/7/17.
 */

/*** Message Sending and showing the Message for particular Room ***/
var room = $('#uroom').val();
var userId =$('#userId').val();
var userfbId =$('#userFbid').val();
var userfbImg =$('#userImg').val();
var userName =$('#userName').val();
$(function() {
    var socket = io('/nameSpace');
    socket.on("connect", function() {
        socket.emit("enter room", room);
        socket.emit("fetch previous", room);
    });
    socket.on("fetch previous", function(prevMsg) {
        for (var i = 0; i < prevMsg.length; i++) {
            var _htmltags = "<li><div><img src='" + prevMsg[i].picDisplay + "'/>" +
                "<p><strong>" + prevMsg[i].displayName + "</strong></p>" +
                "<p>" + prevMsg[i].chatMessage + "</p></div></li>";
            $('#messages').append(_htmltags);
        }
    })
    $('#sendmsg').submit(function() {
        var spltrm = room.split('_');
        var loginDetails = {
            msg: $('#m').val(),
            sender_id:userId,//"<%=user.id%>",
            fb_userid:userfbId,// "<%=user.fbid%>",
            fb_img: userfbImg,//"<%=user.fbimg%>",
            fb_username:userName ,//"<%=user.name%>",
            room:room,
            receiver_id:spltrm[1],
            creat_date: new Date()
        };
        socket.emit('chat message', loginDetails);
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function(msg) {
        var _htmltags = "<li>" +
            "<img src='" + msg.fb_img + "'/>" +
            "<div><p><strong>" + msg.fb_username + "</strong></p>" +
            +"<p>" + msg.msg + "</p></div></li>";
        $('#messages').append(_htmltags);
    });

    //Creating Group
    $('#group').submit(function() {
        var groupDetails = {
            group_name: $('#gname').val(),
            group_admin:$('#userId').val(),
            group_room:$('#gname').val()+'_'+$('#userId').val(),
            group_count:1,
            creat_date: new Date()
        };
        socket.emit('add group', groupDetails);
        return false;
    });
    socket.on('add group', function(grp) {
        $('#gname').val('');
        var _htmltags = "<a href='/message/"+grp.groupRoom+"'><span>"+
                        "<h3>"+grp.groupName+"</h3>"+
                        "</span></a>";
        $('#dynamicadd').append(_htmltags);
    });
});

/*** Room Creation and the Group Creation adding the Members ***/

