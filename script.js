var f7, mainView;

var month = new Array();
month[0] = "Jan";
month[1] = "Feb";
month[2] = "Mar";
month[3] = "Apr";
month[4] = "May";
month[5] = "Jun";
month[6] = "Jul";
month[7] = "Aug";
month[8] = "Sep";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";

var MainView = React.createClass({
	loadList: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(list) {
				this.setState({list: list});
			}.bind(this)
		});
	},
	deleteItem: function(e) {
		$.ajax({
			url: this.props.url,
			type: 'delete',
			dataType: 'json',
			data: JSON.stringify({delete: e.target.dataset.id}),
			success: function(data) {
				console.log(data);
			},
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function() {
		return {
			list: [],
			edit: {
				title: "New",
				content: ""
			}
		};
	},
	componentDidMount: function() {
		f7 = new Framework7({
			animateNavBackIcon: true
		});
		mainView = f7.addView('.view-main', {
			domCache: true,
			dynamicNavbar: true
		});
		this.loadList();
		setInterval(this.loadList, 2000);
		$(document).on('delete', '.swipeout', this.deleteItem);
	},
	render: function() {
		return (
			<div className="view view-main">
				<div className="navbar">
					<div className="navbar-inner" data-page="index">
						<div className="center sliding">Notes</div>
						<div className="right sliding"><a href="#edit" className="link">New</a></div>
					</div>
					<div className="navbar-inner cached" data-page="edit">
						<div className="left sliding"><a href="#" className="back link"><i className="icon icon-back"></i><span>Notes</span></a></div>
						<div className="center sliding">{this.state.edit.title}</div>
					</div>
				</div>
				<div className="pages navbar-through">
					<div className="page">
						<div className="page-content">
							<List list={this.state.list} />
						</div>
					</div>
					<div className="page cached" data-page="edit">
						<div className="page-content">
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var List = React.createClass({
	render: function() {
		var itemNodes = this.props.list.map(function(item) {
			var date = new Date(item.id.replace(/-/g, "/"));
			var now = new Date();
			var time;
			if (now.getFullYear() == date.getFullYear()) {
				time = month[date.getMonth()] +" "+ date.getDate();
				if (now.getDate() == date.getDate() && now.getTime() - date.getTime() < 86400000) {
					time = date.toTimeString().substring(0,5);
				}
				var yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);
				if (yesterday.getDate() == date.getDate() && Math.abs(yesterday.getTime() - date.getTime()) < 86400000) {
					time = "Yesterday";
				}
			} else {
				time = date.toDateString();
			}
			return (<ListItem id={item.id} title={item.title} content={item.content} time={time} />);
		});
		return (
			<div className="list-block media-list">
				<ul>{itemNodes}</ul>
			</div>
		);
	}
});

var ListItem = React.createClass({
	render: function() {
		return (
			<li className="swipeout" data-id={this.props.id}>
				<div className="swipeout-content">
					<a href="#edit" className="item-content item-link">
						<div className="item-inner">
							<div className="item-title-row">
								<div className="item-title">{this.props.title}</div>
								<div className="item-after">{this.props.time}</div>
							</div>
							<div className="item-text">{this.props.content}</div>
						</div>
					</a>
				</div>
				<div className="swipeout-actions-right">
					<a href="#" className="swipeout-delete swipeout-overswipe"
						data-confirm="Are you sure you want to delete this note?" data-confirm-title="Delete?" data-close-on-cancel="true">Delete</a>
				</div>
			</li>
		);
	}
});

ReactDOM.render(
	<MainView url="http://mobile.sheridanc.on.ca/~liwenc/api.php" />,
	document.querySelector('.views')
);
