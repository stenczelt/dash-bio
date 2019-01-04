import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactSequenceViewer from 'react-sequence-viewer'; 

/**
 * The sequence viewer component is used to display sequences 
 * that represent proteins, strands of genomic information, and
 * more. It can apply a coverage to the sequence supplied (with 
 * clickable coverage sections that can display specific information, 
 * and an optional legend to describe the color codes used), 
 * search through the sequence for specific regex, capture 
 * mouse selection events of subparts of the sequence, display a
 * count of the number of nucleotides or amino acids in the 
 * sequence,
 * Read more about the component here: 
 * https://github.com/FlyBase/react-sequence-viewer
 */
export default class SequenceViewer extends Component {

    constructor(props) {
	super(props);
	this.onMouseSelection = this.onMouseSelection.bind(this);
	this.onSubpartSelected = this.onSubpartSelected.bind(this);
	this.getOnClick = this.getOnClick.bind(this); 
    }


    onMouseSelection(e) {
	e.detail && this.props.setProps({mouseSelection: e.detail});
    }
    onSubpartSelected(e) {
	e.detail && this.props.setProps({subpartSelected: e.detail});
    }

    shouldComponentUpdate(nextProps, nextState){
	const {
	    showLineNumbers,
	    wrapAminoAcids,
	    charsPerLine,
	    toolbar,
	    search,
	    sequence,
	    title,
	    sequenceMaxHeight,
	    badge,
	    coverage,
	    selection,
	    legend
	} = this.props;
	
	if(showLineNumbers !== nextProps.showLineNumbers ||
	   wrapAminoAcids !== nextProps.wrapAminoAcids ||
	   charsPerLine !== nextProps.charsPerLine ||
	   toolbar !== nextProps.toolbar ||
	   search !== nextProps.search ||
	   title !== nextProps.title ||
	   sequenceMaxHeight !== nextProps.sequenceMaxHeight ||
	   badge !== nextProps.badge ||
	   legend !== nextProps.legend ||
	   sequence !== nextProps.sequence
	  ){
	    return true;
	}

	// go through selection
	// save some time by comparing lengths first
	if(selection.length !== nextProps.selection.length){
	    return true;
	}
	if(Object.keys(selection).some(
	    propertyName =>
		selection[propertyName] !== nextProps.selection[propertyName]
	)) {
	    return true;
	}
		
	// otherwise, go through all of the coverage and compare
	if(coverage.length !== nextProps.coverage.length ||
	   coverage.some(
	    (cov, i) =>
		Object.keys(cov).some(
		    propertyName =>
			coverage[i][propertyName] !== nextProps.coverage[i][propertyName]
		)
	)) {
	    return true;
	}

	// if everything is the same, do not update
	return false;	
    }

    getOnClick(i) {
	return (e) => {
	    this.props.setProps({
		coverageClicked: i
	    });
	}
    }

    componentDidUpdate(prevProps, prevState) {
	const {coverage} = this.props;
	
	if(coverage.length !== prevProps.coverage.length ||
	   coverage.some(
	       (cov, i) =>
		   Object.keys(cov).some(
		       propertyName =>
			   coverage[i][propertyName] !== prevProps.coverage[i][propertyName]
		   )
	   )) {
	    for(let i = 0; i < coverage.length; i++) {
		coverage[i].onclick = this.getOnClick(i);
	    }
	    
	    // force update to ensure that all onclick events have registered
	    this.forceUpdate(); 
	}
    }


    
    render() {

	const options = {coverage: this.props.coverage,
			 selection: this.props.selection,
			 setProps: this.props.setProps,
			 showLineNumbers: this.props.showLineNumbers, 
			 wrapAminoAcids: this.props.wrapAminoAcids, 
			 charsPerLine: this.props.charsPerLine, 
			 toolbar: this.props.toolbar, 
			 search: this.props.search,
			 title: this.props.title,
			 sequenceMaxHeight: this.props.sequenceMaxHeight,
			 badge: this.props.badge,
			 onMouseSelection: this.onMouseSelection,
			 onSubpartSelected: this.onSubpartSelected,
			 legend: this.props.legend}	

    return (
		<div id={this.props.id}>
		  <ReactSequenceViewer sequence={this.props.sequence} {...options} />
		</div>
      );
    }
}

SequenceViewer.defaultProps = {
    sequence: '-',
    showLineNumbers: true,
    wrapAminoAcids: true,
    charsPerLine: 40,
    toolbar: false,
    search: true,
    title: '',
    sequenceMaxHeight: '400px',
    badge: true,
    selection: [],
    coverage: []
};

SequenceViewer.propTypes = {

    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * The amino acid sequence that will be displayed. 
     */ 
    sequence: PropTypes.string,

    /**
     * The option of whether or not to display line numbers.
     */
    showLineNumbers: PropTypes.bool,

    /**
     * The option of whether or not to display the list of amino acids
     * as broken up into separate lines of a fixed length set by 
     * charsPerLine.
     */
    wrapAminoAcids: PropTypes.bool,

    /**
     * The number of amino acids that will display per line.
     */
    charsPerLine: PropTypes.number,

    /**
     * The option of whether or not to display a toolbar at the top
     * that allows the user to choose the number of letters per line.
     */
    toolbar: PropTypes.bool,

    /**
     * The option of whether or not to include a search bar in
     * the header. This supports regex.
     */
    search: PropTypes.bool,

    /**
     * A string that displays at the top of the component.
     */
    title: PropTypes.string,

    /**
     * The maximum height of the sequence.
     */
    sequenceMaxHeight: PropTypes.string,

    /**
     * The option of whether or not to display a badge showing the
     * amino acid count at the top of the component beside the title.
     */
    badge: PropTypes.bool,

    /**
     * A highlighted section of the sequence; the color of the highlight 
     * can also be defined. Takes a list of format [min, max, color] where 
     * min is a number that represents the starting index of the selection, 
     * max is a number that represents the stopping index of the selection, 
     * and color is a string that defines the highlight color.
     * Cannot be used at the same time as coverage.
     */
    selection: PropTypes.arrayOf(PropTypes.shape({
	low: PropTypes.number,
	high: PropTypes.number,
	color: PropTypes.string
    })),

    /**
     * A coverage of the entire sequence; each section of the sequence
     * can have its own text color, background color, tooltip (on hover),
     * and an optional underscore. The props start and end represent the
     * beginning and terminating indices of the section in question.
     * Cannot be used at the same time as selection.
     */
    coverage: PropTypes.arrayOf(PropTypes.shape({
	start: PropTypes.number,
	end: PropTypes.number,
	color: PropTypes.string,
	bgcolor: PropTypes.string,
	tooltip: PropTypes.string,
	underscore: PropTypes.bool,
	onclick: PropTypes.func
    })),

    /**
     * A legend corresponding to the color codes above (optionally displayed).
     */
    legend: PropTypes.arrayOf(PropTypes.shape({
	name: PropTypes.string,
	color: PropTypes.string,
	underscore: PropTypes.bool
    })),
	
    
    /**
     * Contains the index of the section that was clicked last in 
     * the coverage list supplied.
     */ 
    coverageClicked: PropTypes.number,

    /**
     * Contains information about the subsequence selected 
     * by the mouse. Start and end refer to the initial and 
     * final indices, respectively, of the subsequence, and 
     * "selection" contains the string that is selected.
     */
    mouseSelection: PropTypes.shape({
	'start': PropTypes.number,
	'end': PropTypes.number,
	'selection': PropTypes.string
    }),

    /**
     * A list of the subparts selected using the 
     * "search" function or the "selection" property. 
     */
    subpartSelected: PropTypes.arrayOf(PropTypes.shape({
	'start': PropTypes.number,
	'end': PropTypes.number,
	'sequence': PropTypes.string
    })),

    /**
     * Dash-assigned callback that should be called whenever any of the
     * properties change.
     */
    setProps: PropTypes.func
}
