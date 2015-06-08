var _ = require('underscore')
var React = require('react');
var BreadCrumbsBar = require('../BreadCrumbsBar.jsx');
var ClusterBox = require('./ClusterBox.jsx');
var DeploymentActions = require('../../actions/DeploymentActions');
var LoadStates = require("../../constants/LoadStates.js");
var DeploymentStore = require('../../stores/DeploymentStore');
var TransitionGroup = React.addons.CSSTransitionGroup;
var DeploymentMetricsGraph = require('./DeploymentMetricsGraph.jsx');

var DeploymentDetail = React.createClass({


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
    DeploymentStore.addChangeListener(this._onChange);
    DeploymentActions.getDeployment(this.state.name);
    DeploymentActions.getDeploymentMetrics(this.state.name, 60);
  },
  componentWillUnmount: function() {
    DeploymentStore.removeChangeListener(this._onChange);
  },
  componentWillRecieveProps: function(nextprops) {
    console.log(nextprops);
  },


  handleSubmit: function() {
    this.props.getDeploymentDetails;
  },
  handleExportAsBlueprint: function(){
    DeploymentActions.getDeploymentAsBlueprint(this.state.deployment, 'application/x-yaml');
    // 'application/x-yaml'
  },
  
  onOptionsUpdate: function(cluster, service, filters, weight){
    //console.log(filters);
    DeploymentActions.putRoutingOption(deployment, cluster, service, filters, weight);
  },

  render: function() {
    deployment = this.state.deployment;

    //grab the endpoint
    var endpoints = [] 
    _.each(deployment.endpoints,function(val,key){
      endpoints.push(<h1 key={key} className='text-muted'>{val} / {key} <small className="muted">endpoint</small></h1>);
    });

    // push cluster into an array
    var clusters = []    
    _.chain(deployment.clusters)
      .pairs()
      .each(function(item,idx){
        clusters.push(<ClusterBox key={item[0]} name={item[0]} cluster={item[1]} onOptionsUpdate={this.onOptionsUpdate} />);
      }, this).value()

    return(
      <TransitionGroup component="div" transitionName="fadeIn" transitionAppear={true}>
      <section id="deployment-single">
        <BreadCrumbsBar/>
        <div className='section-full'>
          <div id="general-metrics" className='detail-section'>
            <div className='endpoints-container'>
              {endpoints}
              <a className='export-link' onClick={this.handleExportAsBlueprint}>Export as Blueprint</a>
              <hr />
            </div>
            <div className="deployment-metrics-container">
              <div className="deployment-status">
                UP
              </div>
              <DeploymentMetricsGraph />
              <DeploymentMetricsGraph />
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
    this.setState(
      {
        deployment: DeploymentStore.getCurrent(),
      }
    )
  }
});
 
module.exports = DeploymentDetail;