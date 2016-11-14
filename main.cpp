#include "mbed.h"
#include "EthernetInterface.h"
#include <cstring>
#define OK 200
#define NOTFOUND 404
#define VERSION "HTTP/1.1"

char * processRequest(char *, int);
char * processResponse(char *);
int main() {
    char * request;
    char * response;
    int reqlength;
    //initialize ethernet connection
    EthernetInterface eth;
    eth.init(); //Use DHCP
    eth.connect();
    printf("IP Address is %s\n", eth.getIPAddress());
    
    
    TCPSocketServer server;
    //bind ethernetconnection to port 80 (HTTP)
    server.bind(80);
    //listen for incoming connections
    if(server.listen()==-1) {
        printf("Problem listening on port 80\n");
        }
    //save the TCPConnection to "client"
    TCPSocketConnection client;
    printf("Looking for a client");
    server.accept(client);
    //receive the request (char *)
    if(client.receive(request,reqlength) == -1){
        printf("No data was received\n");
        }
    //Interpret the request
    response = processRequest(request,reqlength);
    client.send_all(response, (int)strlen(response));
        
    //vb .char http_cmd[] = "GET /media/uploads/mbed_official/hello.txt HTTP/1.0\n\n";  
    //terminate HTTP client connection
    client.close();
    //terminate ethernet bindings.
    eth.disconnect();
    
}

char * processRequest(char * req, int len){
    
    char * method;
    char * url;
    char * dir;
    /*
    *Http request consists of 
    *   1.The method, 2. the url, 3.the version + carriage return line feed.
    */
    //check the method is GET
    for(int i=0;i<3;i++){
    *method++ = *(req+i);
    }
    *(method+3) = '\0';
    if(strcmp(method,"GET")==0){
        printf("GET method has been issued ");
        }
    //check the url
    int index = 4;
    while(*(req+index) != ' '){
        *url = *(req+index);
        url = url++; index++;
        }
    if(strcmp(url,"/")){
        printf("for the \"%s\" URL ",url);
        dir = "root";
        }
      return processResponse(dir);  
        
    }
char * processResponse(char * dir){
        //form an appropriate response based on the url that's accessed.
        char *response;
        if(strcmp(dir,"root") ==0){
            response = VERSION+ " " + OK + " OK\n\n" + "The root directory was accessed!";
            }
        return response;
        } 
        
