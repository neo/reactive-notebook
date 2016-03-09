var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
			success: function(data) {},
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	updateItem: function(props) {
		this.setState({
			edit: props,
			editTitle: "Edit"
		});
	},
	submitForm: function(state) {
		if (state.title || state.content) {
			switch (this.state.editTitle) {
				case "Edit":
					$.ajax({
						url: this.props.url,
						type: 'put',
						dataType: 'json',
						data: JSON.stringify(state),
						success: function(data) {
							this.setState({
								edit: {
									id: "",
									title: "",
									content: "",
									time: ""
								},
								editTitle: ""
							});
						}.bind(this),
						error: function(xhr, status, err) {
							console.error(this.props.url, status, err.toString());
						}.bind(this)
					});
					break;
				case "New":
					state.id = new Date();
					this.state.list.unshift(state);
					$.ajax({
						url: this.props.url,
						type: 'post',
						dataType: 'json',
						data: JSON.stringify(state),
						success: function(data) {
							this.setState({
								edit: {
									id: "",
									title: "",
									content: "",
									time: ""
								},
								editTitle: ""
							});
						}.bind(this),
						error: function(xhr, status, err) {
							this.state.list.shift();
							console.error(this.props.url, status, err.toString());
						}.bind(this)
					});
					break;
			}
		}
	},
	newItem: function() {
		this.setState({
			edit: {
				id: "",
				title: "",
				content: "",
				time: ""
			},
			editTitle: "New"
		});
	},
	childContextTypes: {
		f7: React.PropTypes.object,
		mainView: React.PropTypes.object
	},
	getChildContext: function() {
		return {
			f7: this.f7,
			mainView: this.mainView
		};
	},
	getInitialState: function() {
		return {
			list: [],
			edit: {
				title: "",
				content: ""
			},
			editTitle: ""
		};
	},
	componentDidMount: function() {
		this.f7 = new Framework7({
			animateNavBackIcon: true
		});
		// rewrote this method to prevent actually deleting the node,
		// which would cause a React error of "Invariant Violation".
		this.f7.swipeoutDelete = function (el, callback) {
			el = Dom7(el);
			if (el.length === 0) return;
			if (el.length > 1) el = $(el[0]);
			this.f7.swipeoutOpenedEl = undefined;
			el.trigger('delete');
			el.css({height: el.outerHeight() + 'px'});
			var clientLeft = el[0].clientLeft;
			el.css({height: 0 + 'px'}).addClass('deleting transitioning').transitionEnd(function () {
				el.trigger('deleted');
				if (callback) callback.call(el[0]);
			});
			var translate = '-100%';
			el.find('.swipeout-content').transform('translate3d(' + translate + ',0,0)');
		}.bind(this);
		this.mainView = this.f7.addView('.view-main', {
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
						<div className="right sliding"><a href="#edit" className="link" onClick={this.newItem}>New</a></div>
					</div>
					<div className="navbar-inner cached" data-page="edit">
						<div className="left sliding"><a href="#" className="back link"><i className="icon icon-back"></i><span>Notes</span></a></div>
						<div className="center sliding">{this.state.editTitle}</div>
					</div>
				</div>
				<div className="pages navbar-through">
					<div className="page">
						<div className="page-content">
							<List list={this.state.list} updateItem={this.updateItem} />
						</div>
					</div>
					<div className="page cached" data-page="edit">
						<div className="page-content">
							<Form edit={this.state.edit} submitForm={this.submitForm} />
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
			var date = item.id.replace ? new Date(item.id.replace(/-/g, "/")) : item.id;
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
			return (<ListItem id={item.id} title={item.title} content={item.content} time={time} updateItem={this.props.updateItem} key={item.id} />);
		}.bind(this));
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
					<a href="#edit" className="item-content item-link" onClick={this.props.updateItem.bind(null, this.props)}>
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

var Form = React.createClass({
	titleChange: function(e) {
		this.setState({title: e.target.value});
	},
	contentChange: function(e) {
		this.setState({content: e.target.value});
	},
	contextTypes: {
		f7: React.PropTypes.object,
		mainView: React.PropTypes.object
	},
	getInitialState: function() {
		return {title: '', content: ''};
	},
	componentDidMount: function() {
		$('form').submit(function(e) {
			e.preventDefault();
			this.context.mainView.router.back();
			this.props.submitForm(this.state);
		}.bind(this));
		$(document).on('pageBack', '.page', function(e) {
			$('form').submit();
			this.setState({
				id: "",
				title: "",
				content: "",
				time: ""
			});
		}.bind(this));
	},
	componentWillReceiveProps: function(props) {
		if (JSON.stringify(this.props) != JSON.stringify(props)) {
			this.setState(props.edit);
			setTimeout(function() {
				this.context.f7.resizeTextarea('textarea');
			}.bind(this), 0);
		}
	},
	render: function() {
		return (
			<form className="list-block">
				<ul>
					<li>
						<div className="item-content">
							<div className="item-inner">
								<div className="item-input">
									<input type="text" value={this.state.title} onChange={this.titleChange} />
								</div>
							</div>
						</div>
					</li>
					<li className="align-top">
						<div className="item-content">
							<div className="item-inner">
								<div className="item-input">
									<textarea className="resizable" value={this.state.content} onChange={this.contentChange}></textarea>
								</div>
							</div>
						</div>
					</li>
				</ul>
			</form>
		);
	}
});

ReactDOM.render(
	<MainView url="http://mobile.sheridanc.on.ca/~liwenc/api.php" />,
	document.querySelector('.views')
);
