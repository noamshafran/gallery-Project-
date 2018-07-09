import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import './Image.scss';

class Image extends React.Component {
  static propTypes = {
    dto: PropTypes.object,
    galleryWidth: PropTypes.number
  };


  constructor(props) {
    super(props);
    this.calcImageSize = this.calcImageSize.bind(this);
    this.state = {
      size: 200,
      backgroundDegree:0,
      buttonsDegree:0,
      shouldResize:false
    };
    this.rotate = this.rotate.bind(this)
    this.allowDrop= this.allowDrop.bind(this);
  }


  calcImageSize() {
    const {galleryWidth} = this.props;

    const targetSize = 200;
    const imagesPerRow = Math.round(galleryWidth / targetSize);
    const size = (galleryWidth / imagesPerRow);
    this.setState({
      size
    });
  }

  componentDidMount() {
    this.calcImageSize();
  }

  componentWillReceiveProps(props) {
    if(this.props.resizeActionTriggered){
      this.calcImageSize()

    }

  }
  urlFromDto(dto) {
    return `https://farm${dto.farm}.staticflickr.com/${dto.server}/${dto.id}_${dto.secret}.jpg`;
  }



  rotate(){
    this.setState({
      backgroundDegree:this.state.backgroundDegree+90,
      buttonsDegree:this.state.buttonsDegree-90
    })
  }
  allowDrop(e) {
    e.preventDefault();
  }
  render() {
    return (
      <div draggable={true} onDragStart={this.props.dragStartHandler} onDrop={this.props.dropHandler} onDragOver={this.allowDrop}
        className="image-root"
        style={{
          backgroundImage: `url(${this.urlFromDto(this.props.dto)})`,
          width: this.props.isExpanded  && this.props.size ? this.props.size.width/2 : this.state.size + 'px',
          height: this.props.isExpanded  && this.props.size ? this.props.size.height : this.state.size + 'px',
          position:this.props.isExpanded && this.props.size ? `absolute`  : `static`,
          bottom:`28%`,
          left:`33%`,
         transform: `rotate(${this.state.backgroundDegree}deg)`
        }}
        >
        <div style={{
          transform:`rotate(${this.state.buttonsDegree}deg)`,
          display:this.props.isExpanded ? 'none'  : 'block'
        }}>
          <i onClick={this.rotate}>
            <FontAwesome className="image-icon" name="sync-alt" title="rotate"/>
          </i>

          <i onClick={ ()=>{
            this.props.onImageRemove(this.props.dto)
          }}>
            <FontAwesome className="image-icon" name="trash-alt" title="delete"/>
          </i>

          <i onClick={()=>this.props.onImageExpand(this.props.dto)}>
            <FontAwesome className="image-icon" name="expand" title="expand"/>
          </i>

      </div>
      </div>
    );
  }
}

export default Image;
