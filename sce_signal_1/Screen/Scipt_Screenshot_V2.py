from PyQt5.QtCore import QTimer

fileName = 'C:/Users/Epapon/Desktop/Denver/HTML/Screen/Screen_' # Screenshot folder
layer = qgis.utils.iface.activeLayer() # Define the active layer
a=1


def prepareMap(): # Screenshot folder
    layer.select(a) # Select the a feature of the layer
    qgis.utils.iface.actionZoomToSelected().trigger() # Zoom on that feature
    layer.deselect(a) # unselect that feature
    QTimer.singleShot(1000, exportMap) # Wait a second and export the map
    
def exportMap(): # Save the map as a PNG
    global a
    value = layer.getFeature(a).attribute(0) # Get one of the attribute to set the PNG name
    qgis.utils.iface.mapCanvas().saveAsImage(fileName + str(value) +'.PNG') # Screenshot of the map (zoomed on the feature) + Export
    print ("Map with layer",a,"exported!")
    if a < 517: # Number of feature
        QTimer.singleShot(500, prepareMap) # Wait a second and prepare next map
        
    a += 1

prepareMap()
