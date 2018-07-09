import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Image from '../Image';
import './Gallery.scss';
import FontAwesome from 'react-fontawesome';
import ReactDOM from 'react-dom'

class Gallery extends React.Component {
  static propTypes = {
    tag: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      images: [],
      galleryWidth: this.getGalleryWidth(),
      galleryHeight: this.getGalleryHeight(),
      isExpanded:false,
      currentImageIndex:0,
      responsePageNumber:1,
      resizeActionTriggered:false

    };
    this.removeImageHandler = this.removeImageHandler.bind(this);
    this.expandImageHandler = this.expandImageHandler.bind(this);
    this.injectExpandedImage = this.injectExpandedImage.bind(this);
    this.closeExpandedMode   =   this.closeExpandedMode.bind(this);
    this.expandedModeNextPicture =this.expandedModeNextPicture.bind(this);
    this.expandedModePrevPicture = this.expandedModePrevPicture.bind(this);
    this.dragStartHandler = this.dragStartHandler.bind(this);
    this.dropHandler = this.dropHandler.bind(this);
    this.reArrangeImages = this.reArrangeImages.bind(this);
  }

  getGalleryWidth(){
    try {
      return document.documentElement.clientWidth;
    } catch (e) {
      return 1000;
    }
  }
  getGalleryHeight(){
    try {
      return  document.documentElement.clientHeight;
    } catch (e) {
      return 1000;
    }
  }
  getImages(tag,page) {
    const getImagesUrl = `services/rest/?method=flickr.photos.search&api_key=522c1f9009ca3609bcbaf08545f067ad&tags=${tag}&tag_mode=any&per_page=100&format=json&safe_search=1&nojsoncallback=1&page=${page}`;
    const baseUrl = 'https://api.flickr.com/';
    axios({
      url: getImagesUrl,
      baseURL: baseUrl,
      method: 'GET'
    })
      .then(res => res.data)
      .then(res => {
        console.log(res)
        if (
          res &&
          res.photos &&
          res.photos.photo &&
          res.photos.photo.length > 0
        ) {
          this.setState({
            images: this.state.images.length === 0 ? res.photos.photo : [...this.state.images,...res.photos.photo]
          });
        }
      });
  }


  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, false);
    window.addEventListener('resize',this.onResize,false)
    let height = Math.max(
      window.outerHeight,
      document.body.scrollHeight,
      document.body.clientHeight,
      document.body.offsetHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight);
    this.getImages(this.props.tag,this.state.responsePageNumber);
    this.setState({
      galleryWidth: document.body.clientWidth,
      galleryHeight: document.body.clientHeight
    });
  }

  onResize = ()=>{
      this.setState({
        galleryWidth:this.getGalleryWidth(),
        galleryHeight:this.getGalleryHeight(),
        resizeActionTriggered:true
      },()=>{
        this.setState({
          resizeActionTriggered:false
        })
      })
  }
  onScroll = () => {

   let isInViewport = (element)=>{
     console.log(element);
     let domElement = ReactDOM.findDOMNode(element)
      if(element !== null && element !== undefined){
        var rect = domElement.getBoundingClientRect();
        var html = document.documentElement;
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight+1 || html.scrollHeight) &&
          rect.right <= (window.innerWidth || html.clientWidth)
        );
      } else return false
    }


    let isLastImageInViewport = isInViewport(this.lastImage);
    if(isLastImageInViewport){
      console.log(this.state.responsePageNumber);
      this.setState({
        responsePageNumber:++this.state.responsePageNumber
      })
      console.log(this.state.responsePageNumber);
      this.getImages(this.props.tag,this.state.responsePageNumber);
    }

  }


  expandedModeNextPicture = ()=>{
    let nextImageIndex = this.state.currentImageIndex < this.state.images.length-1 ? ++this.state.currentImageIndex : 0
    this.setState({
      currentImageIndex: nextImageIndex
    })
  }
  expandedModePrevPicture = ()=>{
    let prevImageIndex = this.state.currentImageIndex > 0 ?  --this.state.currentImageIndex : this.state.images.length-1
    this.setState({
      currentImageIndex: prevImageIndex
    })
  }
  componentWillReceiveProps(props) {
    this.getImages(props.tag,this.state.responsePageNumber);
  }

  removeImageHandler(dto){
    this.setState({
     images: this.state.images.filter((image)=>{
       return image.id !== dto.id
       })
    })
  }

  closeExpandedMode = ()=>{
    document.body.style.overflow = "auto";
    this.setState({
      isExpanded:false
    })
  }

  reArrangeImages(draggedImageIndex,droppedImageIndex){
    let fromDraggedImage = this.state.images.slice(parseInt(draggedImageIndex)+1);
    fromDraggedImage.splice(parseInt(droppedImageIndex)-parseInt(draggedImageIndex),0,this.state.images[draggedImageIndex]);
    let beforeDraggedImage;
    if (draggedImageIndex>0){
      beforeDraggedImage = this.state.images.slice(0,parseInt(draggedImageIndex));

    }
    this.setState({
      images:beforeDraggedImage ? beforeDraggedImage.concat(fromDraggedImage) : fromDraggedImage
    })
  }


  injectExpandedImage(){
    if(this.state.images.length === 0)
      return <div></div>;
    else
    {
      return (
        <div style={{
          position:`absolute`,
          height:`100%`,
          width:`100%`,
          marginLeft:`5%`,
          marginRight:`5%`,
          top:0,
        }} ref={(el)=> this.galleryTop = el }>
          <Image

            size={{width:this.state.galleryWidth*0.75,height:document.documentElement.clientHeight*0.5}}
                 key={'image-' + this.state.images[this.state.currentImageIndex].id}
                 galleryWidth={this.state.galleryWidth} dto={this.state.images[this.state.currentImageIndex]}
                 onImageRemove={(dto) => this.removeImageHandler(dto)} isExpanded={this.state.isExpanded}
                 onImageExpand={(dto) => this.expandImageHandler(dto)}  resizeActionTriggered={this.state.resizeActionTriggered}

          />
            <i onClick={()=>this.expandedModePrevPicture()} style={{

             position:`absolute`,
             left:`20%`,
             top:`45%`,
              color:`white`

            }}>
              <FontAwesome className="image-icon" name="arrow-left" title="prev"
                           size={this.state.galleryWidth > 1000 ? `5x` : this.state.galleryWidth > 550 ?  `3x` : `2x`}/>
            </i>
            <i onClick={()=>this.closeExpandedMode()} style={{

              position:`absolute`,
              left:`70%`,
              right:`50%`,
              top:`3%`,
              color:`white`

            }}>
              <FontAwesome className="image-icon" name="times-circle" title="close"
                           size={this.state.width > 1000 ? `3x` : `2x`}/>
              <span style={{
                position:`relative`,
                top:`5px`,
                left:`-5px`,
                color:`white`,
                fontSize:`14pt` ,
                display:`inline-block`,
                fontStyle:`normal`,
                verticalAlign:'super',
              }}>Close</span>
            </i>
            <i onClick={()=>this.expandedModeNextPicture()} style={{

              position:`absolute`,
              right:`20%`,
              top:`45%`,
              color:`white`

            }}>
              <FontAwesome className="image-icon" name="arrow-right" title="next"
                           size={this.state.galleryWidth > 1000 ? `5x` : this.state.galleryWidth > 550 ?  `3x` : `2x`}/>
            </i>
        </div>
      )
    }
    }

  expandImageHandler(dto){
    this.setState({
      isExpanded:true,
      currentImageIndex:this.state.images.findIndex((image)=>{
        return image.id === dto.id
      })
    })
    this.galleryTop.scrollIntoView({behavior:"smooth"})
    document.body.style.overflow = "hidden";


  }

   dragStartHandler = (e) =>{
     e.dataTransfer.effectAllowed = "copy";
    let imageId = e.target.style.backgroundImage;
    imageId = imageId.split('/')[4];
    imageId = imageId.split('_')[0]

    let draggedImageIndex = this.state.images.findIndex((elem)=>{
      return imageId===elem.id
    });

    e.dataTransfer.setData("Text", draggedImageIndex);


  }

  dropHandler = (e)=>{
    console.log(e.target);
    e.dataTransfer.effectAllowed = "copy";
    const draggedImageId = e.dataTransfer.getData("Text");
    let imageId = e.target.style.backgroundImage;
    imageId = imageId.split('/')[4];
    imageId = imageId.split('_')[0]

    let droppedImageIndex = this.state.images.findIndex((elem)=>{
      return imageId===elem.id
    });
    this.reArrangeImages(draggedImageId,droppedImageIndex)
  }
  render() {
    return (
      <div className="gallery-root">
        {this.state.images.map((dto,index) => {

          return ( ! (index=== this.state.images.length-1) ?
          <Image dropHandler={(event)=>this.dropHandler(event)} dragStartHandler={(event)=>this.dragStartHandler(event)}
                 key={'image-' + dto.id *Math.round(Math.random(0.5)*10000) } dto={dto} galleryHeight={this.state.galleryHeight} galleryWidth={this.state.galleryWidth} onImageRemove={(dto)=>this.removeImageHandler(dto)}
                 isExpanded={this.state.isExpanded} onImageExpand={(dto)=>this.expandImageHandler(dto)}
                 resizeActionTriggered={this.state.resizeActionTriggered} />
          :
            <Image dropHandler={(event)=>this.dropHandler(event)} dragStartHandler={()=>this.dragStartHandler()}
                   ref={(element)=> this.lastImage=element} key={'image-' + dto.id * Math.round(Math.random(0.5)*10000)} dto={dto}
                   galleryHeight={this.state.galleryHeight} galleryWidth={this.state.galleryWidth}
                   onImageRemove={(dto)=>this.removeImageHandler(dto)} isExpanded={this.state.isExpanded}
                   onImageExpand={(dto)=>this.expandImageHandler(dto)}
                   resizeActionTriggered={this.state.resizeActionTriggered}
                  />
          )
        })}
          <div  style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            width: this.state.galleryWidth,
            height: this.state.galleryHeight,
            overflow:`hidden`,
            zIndex: 100,
            position: 'absolute',
            top:0,
            visibility: this.state.isExpanded ? 'visible' : 'hidden'
          }}>
            {this.injectExpandedImage()}
          </div>
      </div>
    );
  }
}

export default Gallery;
