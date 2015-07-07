var _ = require('underscore');
var React = require('react/addons');
var classNames = require('classnames');
var SetIntervalMixin = require("../../mixins/SetIntervalMixin.js");
var BreadCrumbsBar = require('../BreadCrumbsBar.jsx');
var ClusterBox = require('./ClusterBox.jsx');
var DeploymentActions = require('../../actions/DeploymentActions');
var LoadStates = require("../../constants/LoadStates.js");
var DeploymentStore = require('../../stores/DeploymentStore');
var TransitionGroup = React.addons.CSSTransitionGroup;
var DeploymentMetricsGraph = require('./DeploymentMetricsGraph.jsx');

var DeploymentDetail = React.createClass({
  
  mixins: [SetIntervalMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function() {
    return  {
      loadState: LoadStates.STATE_LOADING,
      deployment: {},
      name: this.context.router.getCurrentParams().id
    }
  },
  componentDidMount: function() {
    DeploymentActions.getDeployment(this.state.name);
    DeploymentStore.addChangeListener(this._onChange);
    
    this.setState({
      deployment: DeploymentStore.getCurrent()
    });

    DeploymentActions.getDeploymentMetrics(deployment, 'rate');
    DeploymentActions.getDeploymentMetrics(deployment, 'scur');      

    this.setInterval(function(){
      console.log('poll metrics');
      DeploymentActions.getDeploymentMetrics(deployment, 'rate');
      DeploymentActions.getDeploymentMetrics(deployment, 'scur');
    }, 4000);
  },
  componentWillUnmount: function() {
    DeploymentStore.removeChangeListener(this._onChange);
  },


  handleSubmit: function() {
    this.props.getDeploymentDetails;
  },
  handleExportAsBlueprint: function(type){
    DeploymentActions.getDeploymentAsBlueprint(this.state.deployment, type);
  },
  
  onOptionsUpdate: function(cluster, service, filters, weight){
    DeploymentActions.putRoutingOption(deployment, cluster, service, filters, weight);
  },

  render: function() {
    
    deployment = this.state.deployment;
    var errorsToBeShown = this.props.errors['UNREACHABLE'] ? true : false,
        errorMessage = errorsToBeShown ? this.props.errors['UNREACHABLE'].message : '';

    //grab the endpoint
    var endpoints = [] 
    _.each(deployment.endpoints,function(val,key){
      endpoints.push(<h1 key={key} className='text-muted'>{val} / {key} <small className="muted">endpoint</small></h1>);
    });

    // push cluster into an array
    var clusters = [];
    _.chain(deployment.clusters)
      .pairs()
      .each(function(item,idx){
        clusters.push(<ClusterBox key={item[0]} name={item[0]} cluster={item[1]} serviceMetrics={deployment.serviceMetrics} onOptionsUpdate={this.onOptionsUpdate} />);
      }, this).value()

    // Setup dynamic classes
    var containerClassnames = classNames({
      'dimmed': true
    });
    var errorMessageClassSet = classNames({
      "error-status-message": true,
      "container-status-message": true,
      "hidden": !errorsToBeShown
    });

    return(
      <TransitionGroup component="div" transitionName="fadeIn" transitionAppear={true}>
      <span className={errorMessageClassSet}>{errorMessage}</span>        
      <section id="deployment-single" className={containerClassnames}>
        <BreadCrumbsBar/>
        <div className='section-full'>
          <div id="general-metrics" className='detail-section'>
            <div className='endpoints-container'>
              <ul className='export-links dropdown-list'>
                <li className='first-item'><a onClick={this.handleExportAsBlueprint.bind(this, 'application/x-yaml')}>Export as Blueprint</a></li>
                <li onClick={this.handleExportAsBlueprint.bind(this, 'application/x-yaml')}><a>YAML</a></li>
                <li onClick={this.handleExportAsBlueprint.bind(this, 'application/json')}><a>JSON</a></li>
              </ul>
              {endpoints}
              <hr />
            </div>
            <div className="deployment-metrics-container">
              <div className="deployment-status hidden">
                UP
              </div>
              <DeploymentMetricsGraph data={deployment.rate} metricsType='rate' />
              <DeploymentMetricsGraph data={deployment.scur} metricsType='scur' />
            </div>
          </div>
          <div className='detail-section'>
              {clusters}
          </div>
        </div>
      </section>
      </TransitionGroup>
  )},

  _onChange: function() {
    this.setState({
      deployment: DeploymentStore.getCurrent(),
    });
  }
});
 
module.exports = DeploymentDetail;